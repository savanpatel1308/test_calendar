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
  TimePicker, 
  Checkbox, 
  Select, 
  message, 
  Typography, 
  Space,
  Spin,
  Popover,
  List,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  BellOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { format, parseISO, isWithinInterval, isToday, isSameDay } from 'date-fns';
import EventService from '../services/EventService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
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
      // Format values for API
      const eventData = {
        ...values,
        start_time: values.dateRange[0].toISOString(),
        end_time: values.dateRange[1].toISOString(),
        all_day: values.all_day || false,
        recurring: values.recurring || 'none',
        attendees: values.attendees || [],
        reminders: values.reminders ? [{
          remind_at: values.remind_at.toISOString(),
          reminder_type: values.reminder_type || 'notification'
        }] : []
      };

      // Remove fields not needed by API
      delete eventData.dateRange;
      delete eventData.remind_at;
      delete eventData.reminder_type;

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

      // Format values for API
      const eventData = {
        ...values,
        start_time: values.dateRange[0].toISOString(),
        end_time: values.dateRange[1].toISOString(),
        all_day: values.all_day || false,
        recurring: values.recurring || 'none',
        attendees: values.attendees || [],
        reminders: values.reminders ? [{
          remind_at: values.remind_at.toISOString(),
          reminder_type: values.reminder_type || 'notification'
        }] : []
      };

      // Remove fields not needed by API
      delete eventData.dateRange;
      delete eventData.remind_at;
      delete eventData.reminder_type;

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

    const reminders = event.reminders && event.reminders.length > 0;
    
    editForm.setFieldsValue({
      title: event.title,
      description: event.description,
      location: event.location,
      dateRange,
      all_day: event.all_day,
      recurring: event.recurring || 'none',
      attendees: event.attendees ? event.attendees.map(a => a.user_id) : [],
      reminders,
      remind_at: reminders ? dayjs(event.reminders[0].remind_at) : null,
      reminder_type: reminders ? event.reminders[0].reminder_type : 'notification'
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
              status={event.creator_id === user.id ? "success" : "processing"} 
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

  const renderEventDetails = (event) => (
    <div style={{ maxWidth: 300 }}>
      <Title level={5}>{event.title}</Title>
      
      {event.description && (
        <div style={{ marginBottom: 8 }}>
          <Text>{event.description}</Text>
        </div>
      )}
      
      <div style={{ marginBottom: 8 }}>
        <ClockCircleOutlined style={{ marginRight: 8 }} />
        <Text>
          {format(parseISO(event.start_time), 'MMM dd, yyyy HH:mm')} - 
          {format(parseISO(event.end_time), 'HH:mm')}
        </Text>
      </div>
      
      {event.location && (
        <div style={{ marginBottom: 8 }}>
          <EnvironmentOutlined style={{ marginRight: 8 }} />
          <Text>{event.location}</Text>
        </div>
      )}
      
      {event.attendees && event.attendees.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          <Text>Attendees: {event.attendees.length}</Text>
        </div>
      )}
      
      <Space style={{ marginTop: 16 }}>
        <Button 
          icon={<EditOutlined />} 
          type="primary" 
          size="small"
          onClick={() => openEditModal(event)}
        >
          Edit
        </Button>
        <Button 
          icon={<DeleteOutlined />} 
          danger 
          size="small"
          onClick={async () => {
            setCurrentEvent(event);
            await handleDeleteEvent();
          }}
        >
          Delete
        </Button>
      </Space>
    </div>
  );

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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>My Calendar</Title>
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
      </Header>
      
      <Content style={{ padding: '24px', background: '#fff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Calendar 
            dateCellRender={dateCellRender} 
            monthCellRender={monthCellRender}
          />
        )}
      </Content>
      
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
            reminder_type: 'notification',
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
          
          <Form.Item name="reminders" valuePropName="checked">
            <Checkbox>Set Reminder</Checkbox>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.reminders !== currentValues.reminders}
          >
            {({ getFieldValue }) => 
              getFieldValue('reminders') ? (
                <>
                  <Form.Item
                    name="remind_at"
                    label="Remind At"
                    rules={[{ required: true, message: 'Please select reminder time' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Form.Item name="reminder_type" label="Reminder Type">
                    <Select>
                      <Option value="notification">Notification</Option>
                      <Option value="email">Email</Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null
            }
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
          
          <Form.Item name="reminders" valuePropName="checked">
            <Checkbox>Set Reminder</Checkbox>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.reminders !== currentValues.reminders}
          >
            {({ getFieldValue }) => 
              getFieldValue('reminders') ? (
                <>
                  <Form.Item
                    name="remind_at"
                    label="Remind At"
                    rules={[{ required: true, message: 'Please select reminder time' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Form.Item name="reminder_type" label="Reminder Type">
                    <Select>
                      <Option value="notification">Notification</Option>
                      <Option value="email">Email</Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null
            }
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
    </Layout>
  );
};

export default CalendarPage;