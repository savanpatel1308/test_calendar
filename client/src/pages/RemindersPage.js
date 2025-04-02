// src/pages/RemindersPage.js
import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  List, 
  Typography, 
  Card, 
  Tag, 
  Empty, 
  Spin,
  Button
} from 'antd';
import { BellOutlined, CalendarOutlined } from '@ant-design/icons';
import { format, parseISO, isBefore } from 'date-fns';
import EventService from '../services/EventService';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const RemindersPage = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventService.getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all events with reminders
  const eventsWithReminders = events.filter(event => 
    event.reminders && event.reminders.length > 0
  );

  const getTimeRemaining = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const isPast = isBefore(eventDate, now);
    
    if (isPast) {
      return "Past due";
    }
    
    const diffMs = eventDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  return (
    <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>My Reminders</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : eventsWithReminders.length === 0 ? (
        <Empty 
          description="No reminders found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<CalendarOutlined />}
            onClick={() => navigate('/calendar')}
          >
            Go to Calendar
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={eventsWithReminders}
          renderItem={event => (
            <List.Item>
              <Card 
                style={{ width: '100%' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BellOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <span>{event.title}</span>
                  </div>
                }
                hoverable
                onClick={() => navigate('/calendar')}
              >
                <div>
                  <Text strong>Event Time: </Text>
                  <Text>{format(parseISO(event.start_time), 'MMM dd, yyyy HH:mm')}</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Reminders: </Text>
                    <div style={{ marginTop: '4px' }}>
                      {event.reminders.map((reminder, index) => (
                        <Tag 
                          color={reminder.reminder_type === 'email' ? 'blue' : 'green'}
                          key={index}
                          style={{ marginBottom: '4px' }}
                        >
                          {format(parseISO(reminder.remind_at), 'MMM dd, yyyy HH:mm')} 
                          {' - '}
                          {reminder.reminder_type === 'email' ? 'Email' : 'Notification'}
                          {' ('}
                          {getTimeRemaining(reminder.remind_at)}
                          {')'}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </Content>
  );
};

export default RemindersPage;