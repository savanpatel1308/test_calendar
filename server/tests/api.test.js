const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User'
};

let authToken;
let userId;
let eventId;

// Setup - create user once
beforeAll(async () => {
  // Remove any leftover test user
  await db.query('DELETE FROM users WHERE email = ?', [testUser.email]);

  const passwordHash = await bcrypt.hash(testUser.password, 10);
  const [result] = await db.query(
    'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
    [testUser.username, testUser.email, passwordHash, testUser.first_name, testUser.last_name]
  );

  userId = result.insertId;

  authToken = jwt.sign(
    { id: userId, username: testUser.username, email: testUser.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
});

// Cleanup between tests (but keep the user)
afterEach(async () => {
  await db.query('DELETE FROM event_attendees');
  await db.query('DELETE FROM reminders');
  await db.query('DELETE FROM events');
});

// Final cleanup
afterAll(async () => {
  await db.query('DELETE FROM event_attendees');
  await db.query('DELETE FROM reminders');
  await db.query('DELETE FROM events');
  await db.query('DELETE FROM users WHERE username = ?', [testUser.username]);
  await db.end();
});

// Auth tests
describe('Authentication API', () => {
  test('POST /api/users/login - should login successfully', async () => {
    const response = await request(app.callback())
      .post('/api/users/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.username).toBe(testUser.username);
  });

  test('POST /api/users/login - should fail with invalid credentials', async () => {
    const response = await request(app.callback())
      .post('/api/users/login')
      .send({
        username: testUser.username,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
  });

  test('GET /api/users/me - should return current user', async () => {
    const response = await request(app.callback())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('username', testUser.username);
    expect(response.body.data).toHaveProperty('email', testUser.email);
  });
});

// Events tests
describe('Events API', () => {
  test('POST /api/events - should create an event', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      all_day: false,
      recurring: 'none',
      attendees: [],
      reminders: [
        {
          remind_at: new Date(Date.now() + 1800000).toISOString(),
          reminder_type: 'notification'
        }
      ]
    };

    const response = await request(app.callback())
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(eventData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('title', eventData.title);
    expect(response.body.data).toHaveProperty('description', eventData.description);
    expect(response.body.data).toHaveProperty('creator_id', userId);
    expect(response.body.data).toHaveProperty('reminders');
    expect(response.body.data.reminders.length).toBe(1);

    eventId = response.body.data.id;
  });

  test('GET /api/events - should return all events', async () => {
    // Create an event first to ensure there's at least one to retrieve
    const eventData = {
      title: 'List Test Event',
      description: 'For list test',
      location: 'Test Location',
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      all_day: false,
      recurring: 'none',
      attendees: [],
      reminders: []
    };

    await request(app.callback())
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(eventData);

    const response = await request(app.callback())
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/events/:id - should return a specific event', async () => {
    // Create an event first
    const eventData = {
      title: 'Specific Event',
      description: 'For get test',
      location: 'Test Place',
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      all_day: false,
      recurring: 'none',
      attendees: [],
      reminders: []
    };

    const create = await request(app.callback())
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(eventData);

    eventId = create.body.data.id;

    const response = await request(app.callback())
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id', eventId);
    expect(response.body.data).toHaveProperty('title', 'Specific Event');
  });

  test('PUT /api/events/:id - should update an event', async () => {
    const updateData = {
      title: 'Updated Test Event',
      description: 'Updated Description'
    };

    // Create event to update
    const create = await request(app.callback())
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Temp Event',
        description: 'to update',
        location: 'nowhere',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
        all_day: false,
        recurring: 'none',
        attendees: [],
        reminders: []
      });

    const id = create.body.data.id;

    const response = await request(app.callback())
      .put(`/api/events/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('title', updateData.title);
    expect(response.body.data).toHaveProperty('description', updateData.description);
  });

  test('DELETE /api/events/:id - should delete an event', async () => {
    // Create event to delete
    const create = await request(app.callback())
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Delete Me',
        description: 'Temp',
        location: 'nowhere',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
        all_day: false,
        recurring: 'none',
        attendees: [],
        reminders: []
      });

    const id = create.body.data.id;

    const response = await request(app.callback())
      .delete(`/api/events/${id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');

    const getResponse = await request(app.callback())
      .get(`/api/events/${id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getResponse.status).toBe(404);
  });
});
