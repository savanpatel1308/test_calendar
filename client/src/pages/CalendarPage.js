import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Calendar, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Checkbox, 
  Select, 
  message, 
  Typography, 
  Space,
  Spin,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EnvironmentOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { parseISO, isSameDay, addMinutes, addHours, addDays } from 'date-fns';
import EventService from '../services/EventService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

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
      message.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (values) => {
    try {
      // Get start and end times
      const startTime = values.dateRange[0].toDate();
      const endTime = values.dateRange[1].toDate();
      
      // Prepare reminders array based on preferences
      const reminders = [];
      
      if (values.reminder_day_before) {
        reminders.push({
          remind_at: addDays(startTime, -1).toISOString(),
          reminder_type: 'email'
        });
      }
      
      if (values.reminder_hour_before) {
        reminders.push({
          remind_at: addHours(startTime, -1).toISOString(),
          reminder_type: 'email'
        });
      }
      
      if (values.reminder_20min_before) {
        reminders.push({
          remind_at: addMinutes(startTime, -20).toISOString(),
          reminder_type: 'notification'
        });
      }
      
      // Format values for API
      const eventData = {
        ...values,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        all_day: values.all_day || false,
        recurring: values.recurring || 'none',
        attendees: values.attendees || [],
        reminders: reminders
      };

      // Remove fields not needed by API
      delete eventData.dateRange;
      delete eventData.reminder_day_before;
      delete eventData.reminder_hour_before;
      delete eventData.reminder_20min_before;

      await EventService.createEvent(eventData);
      message.success('Event created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Failed to create event');
    }
  };

  const handleEditEvent = async (values) => {
    try {
      if (!currentEvent) return;

      // Get start and end times
      const startTime = values.dateRange[0].toDate();
      const endTime = values.dateRange[1].toDate();
      
      // Prepare reminders array based on preferences
      const reminders = [];
      
      if (values.reminder_day_before) {
        reminders.push({
          remind_at: addDays(startTime, -1).toISOString(),
          reminder_type: 'email'
        });
      }
      
      if (values.reminder_hour_before) {
        reminders.push({
          remind_at: addHours(startTime, -1).toISOString(),
          reminder_type: 'email'
        });
      }
      
      if (values.reminder_20min_before) {
        reminders.push({
          remind_at: addMinutes(startTime, -20).toISOString(),
          reminder_type: 'notification'
        });
      }
      
      // Format values for API
      const eventData = {
        ...values,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        all_day: values.all_day || false,
        recurring: values.recurring || 'none',
        attendees: values.attendees || [],
        reminders: reminders
      };

      // Remove fields not needed by API
      delete eventData.dateRange;
      delete eventData.reminder_day_before;
      delete eventData.reminder_hour_before;
      delete eventData.reminder_20min_before;

      await EventService.updateEvent(currentEvent.id, eventData);
      message.success('Event updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      message.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!currentEvent) return;

    try {
      await EventService.deleteEvent(currentEvent.id);
      message.success('Event deleted successfully');
      setEditModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Failed to delete event');
    }
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    
    // Format dates for form
    const dateRange = [
      dayjs(event.start_time),
      dayjs(event.end_time)
    ];

    // Check if reminders exist for this event
    const reminderDayBefore = event.reminders?.some(r => 
      new Date(r.remind_at).getDate() === new Date(addDays(new Date(event.start_time), -1)).getDate()
    );
    
    const reminderHourBefore = event.reminders?.some(r => {
      const remindDate = new Date(r.remind_at);
      const oneHourBefore = addHours(new Date(event.start_time), -1);
      return Math.abs(remindDate.getTime() - oneHourBefore.getTime()) < 1000 * 60 * 5; // Within 5 minutes
    });
    
    const reminder20MinBefore = event.reminders?.some(r => {
      const remindDate = new Date(r.remind_at);
      const twentyMinBefore = addMinutes(new Date(event.start_time), -20);
      return Math.abs(remindDate.getTime() - twentyMinBefore.getTime()) < 1000 * 60 * 5; // Within 5 minutes
    });
    
    editForm.setFieldsValue({
      title: event.title,
      description: event.description,
      location: event.location,
      dateRange,
      all_day: event.all_day,
      recurring: event.recurring || 'none',
      attendees: event.attendees ? event.attendees.map(a => a.user_id) : [],
      reminder_day_before: reminderDayBefore,
      reminder_hour_before: reminderHourBefore,
      reminder_20min_before: reminder20MinBefore
    });
    
    setEditModalVisible(true);
  };

  const dateCellRender = (value) => {
    const dayEvents = events.filter(event => 
      isSameDay(parseISO(event.start_time), value.toDate())
    );

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvents.slice(0, 3).map(event => (
          <li key={event.id} onClick={(e) => { e.stopPropagation(); openEditModal(event); }}>
            <Badge 
              status={event.creator_id === user?.id ? "success" : "processing"} 
              text={<Text ellipsis style={{ fontSize: '12px' }}>{event.title}</Text>} 
            />
          </li>
        ))}
        {dayEvents.length > 3 && (
          <li>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              +{dayEvents.length - 3} more
            </Text>
          </li>
        )}
      </ul>
    );
  };

  const monthCellRender = (value) => {
    const monthEvents = events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return eventDate.getMonth() === value.month() && eventDate.getFullYear() === value.year();
    });

    if (monthEvents.length === 0) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <Badge count={monthEvents.length} style={{ backgroundColor: '#52c41a' }} />
      </div>
    );
  };

  return (
    <Content style={{ padding: '24px', background: '#fff' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                form.resetFields();
                setCreateModalVisible(true);
              }}
            >
              New Event
            </Button>
          </div>
          <Calendar 
            dateCellRender={dateCellRender} 
            monthCellRender={monthCellRender}
          />
        </>
      )}
      
      {/* Create Event Modal */}
      <Modal
        title="Create New Event"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvent}
          initialValues={{
            recurring: 'none',
            dateRange: [dayjs(), dayjs().add(1, 'hour')]
          }}
        >
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Event Description" />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Location" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="Date and Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="all_day" valuePropName="checked">
            <Checkbox>All Day</Checkbox>
          </Form.Item>
          
          <Form.Item name="recurring" label="Recurring">
            <Select>
              <Option value="none">None</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Form.Item>
          
          <Divider orientation="left">Reminders</Divider>
          
          <Form.Item name="reminder_day_before" valuePropName="checked">
            <Checkbox>Email reminder 1 day before</Checkbox>
          </Form.Item>
          
          <Form.Item name="reminder_hour_before" valuePropName="checked">
            <Checkbox>Email reminder 1 hour before</Checkbox>
          </Form.Item>
          
          <Form.Item name="reminder_20min_before" valuePropName="checked">
            <Checkbox>Notification 20 minutes before</Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Create Event
            </Button>
            <Button onClick={() => setCreateModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        title="Edit Event"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditEvent}
        >
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Event Description" />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Location" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="Date and Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="all_day" valuePropName="checked">
            <Checkbox>All Day</Checkbox>
          </Form.Item>
          
          <Form.Item name="recurring" label="Recurring">
            <Select>
              <Option value="none">None</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Form.Item>
          
          <Divider orientation="left">Reminders</Divider>
          
          <Form.Item name="reminder_day_before" valuePropName="checked">
            <Checkbox>Email reminder 1 day before</Checkbox>
          </Form.Item>
          
          <Form.Item name="reminder_hour_before" valuePropName="checked">
            <Checkbox>Email reminder 1 hour before</Checkbox>
          </Form.Item>
          
          <Form.Item name="reminder_20min_before" valuePropName="checked">
            <Checkbox>Notification 20 minutes before</Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Event
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button danger onClick={handleDeleteEvent} icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default CalendarPage;