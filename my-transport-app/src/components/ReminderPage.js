import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell, faCalendarAlt, faClock, faRoute,
  faMapMarkerAlt, faEdit, faTrash, faCheck, faTimes, faPlus, faTimes as faClose
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../App.css';

const ReminderPage = ({ isActive, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    route: '',
    from_stop: '',
    to_stop: '',
    reminder_time: new Date(),
    advance_notice: 15,
    repeat_type: 'once',
    repeat_days: '',
  });
  const [editingReminderId, setEditingReminderId] = useState(null);

  useEffect(() => {
    if (isActive) {
      loadReminderData();
      loadRoutesAndStops();
    }
  }, [isActive, selectedTab]);

  const loadReminderData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (selectedTab === 'upcoming') {
        response = await apiService.getUpcomingReminders();
      } else if (selectedTab === 'today') {
        response = await apiService.getTodayReminders();
      } else {
        response = await apiService.getReminders({ status: selectedTab });
      }
      setReminders(response.data);
    } catch (err) {
      setError('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutesAndStops = async () => {
    try {
      const [routesResponse, stopsResponse] = await Promise.all([
        apiService.getRoutes(),
        apiService.getStops()
      ]);
      setRoutes(routesResponse.data);
      setStops(stopsResponse.data);
    } catch (err) {
      // ignore
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => {
    setNewReminder(prev => ({ ...prev, reminder_time: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const reminderData = {
        ...newReminder,
        reminder_time: newReminder.reminder_time.toISOString(),
      };
      if (editingReminderId) {
        await apiService.updateReminder(editingReminderId, reminderData);
      } else {
        await apiService.createReminder(reminderData);
      }
      setNewReminder({
        title: '',
        description: '',
        route: '',
        from_stop: '',
        to_stop: '',
        reminder_time: new Date(),
        advance_notice: 15,
        repeat_type: 'once',
        repeat_days: '',
      });
      setEditingReminderId(null);
      setShowAddForm(false);
      loadReminderData();
    } catch (err) {
      setError('Failed to save reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await apiService.cancelReminder(id);
      loadReminderData();
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };
  
  const handleComplete = async (id) => {
    try {
      await apiService.completeReminder(id);
      loadReminderData();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await apiService.deleteReminder(id);
      loadReminderData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };
  const handleEdit = (reminder) => {
    setEditingReminderId(reminder.id);
    setNewReminder({
      title: reminder.title,
      description: reminder.description || '',
      route: reminder.route || '',
      from_stop: reminder.from_stop || '',
      to_stop: reminder.to_stop || '',
      reminder_time: new Date(reminder.reminder_time),
      advance_notice: reminder.advance_notice,
      repeat_type: reminder.repeat_type,
      repeat_days: reminder.repeat_days || '',
    });
    setShowAddForm(true);
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const getRepeatTypeText = (type) => {
    const types = {
      'once': 'One-time',
      'daily': 'Daily',
      'weekdays': 'Weekdays',
      'weekends': 'Weekends',
      'weekly': 'Weekly',
      'monthly': 'Monthly'
    };
    return types[type] || type;
  };

  if (!isActive) return null;

  return (
    <div id="reminderPage" className={`page-content home-style-page ${isActive ? 'active' : ''}`}>
      <div className="reminder-container">
        <div className="reminder-header">
          <h2 className="page-title">Set Reminders</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}
        </div>

        <div className="reminder-tabs">
          <button
            className={selectedTab === 'upcoming' ? 'active' : ''}
            onClick={() => setSelectedTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={selectedTab === 'today' ? 'active' : ''}
            onClick={() => setSelectedTab('today')}
          >
            Today
          </button>
          <button
            className={selectedTab === 'active' ? 'active' : ''}
            onClick={() => setSelectedTab('active')}
          >
            All Active
          </button>
          <button
            className={selectedTab === 'completed' ? 'active' : ''}
            onClick={() => setSelectedTab('completed')}
          >
            Completed
          </button>
          <button
            className={selectedTab === 'cancelled' ? 'active' : ''}
            onClick={() => setSelectedTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <button
          className="add-reminder-button"
          onClick={() => {
            setEditingReminderId(null);
            setNewReminder({
              title: '',
              description: '',
              route: '',
              from_stop: '',
              to_stop: '',
              reminder_time: new Date(),
              advance_notice: 15,
              repeat_type: 'once',
              repeat_days: '',
            });
            setShowAddForm(!showAddForm);
          }}
        >
          <FontAwesomeIcon icon={showAddForm ? faTimes : faPlus} />
          {showAddForm ? ' Cancel' : ' Add New Reminder'}
        </button>

        {error && <div className="error-message">{error}</div>}

        {showAddForm && (
          <div className="reminder-form-container">
            <h3 className="section-title">{editingReminderId ? 'Edit Reminder' : 'Add New Reminder'}</h3>
            <form onSubmit={handleSubmit} className="reminder-form">
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faBell} /> Title:
                  <input
                    type="text"
                    name="title"
                    value={newReminder.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Work Route Reminder"
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faEdit} /> Description (optional):
                  <textarea
                    name="description"
                    value={newReminder.description}
                    onChange={handleInputChange}
                    placeholder="Add details for this reminder"
                  />
                </label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faRoute} /> Route (optional):
                    <select
                      name="route"
                      value={newReminder.route}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Select Route --</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.route_number} - {route.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> From (optional):
                    <select
                      name="from_stop"
                      value={newReminder.from_stop}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Select Origin --</option>
                      {stops.map(stop => (
                        <option key={stop.id} value={stop.id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> To (optional):
                    <select
                      name="to_stop"
                      value={newReminder.to_stop}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Select Destination --</option>
                      {stops.map(stop => (
                        <option key={stop.id} value={stop.id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Reminder Time:
                    <DatePicker
                      selected={newReminder.reminder_time}
                      onChange={handleDateChange}
                      showTimeSelect
                      dateFormat="yyyy-MM-dd HH:mm"
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      className="date-picker"
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faClock} /> Advance Notice (minutes):
                    <input
                      type="number"
                      name="advance_notice"
                      value={newReminder.advance_notice}
                      onChange={handleInputChange}
                      min="0"
                      max="180"
                    />
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Repeat Type:
                    <select
                      name="repeat_type"
                      value={newReminder.repeat_type}
                      onChange={handleInputChange}
                    >
                      <option value="once">One-time</option>
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>
                </div>
                {newReminder.repeat_type === 'weekly' && (
                  <div className="form-group">
                    <label htmlFor="repeatDays">
                      <FontAwesomeIcon icon={faCalendarAlt} /> Repeat Days:
                      <input
                        type="text"
                        id="repeatDays"
                        name="repeat_days"
                        value={newReminder.repeat_days}
                        onChange={handleInputChange}
                        placeholder="e.g. 1,3,5 (Mon,Wed,Fri)"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingReminderId ? 'Update Reminder' : 'Create Reminder')}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="loading-indicator">Loading...</div>
        ) : reminders.length === 0 ? (
          <div className="no-data">
            <p>No {selectedTab === 'upcoming' ? 'upcoming' :
              selectedTab === 'today' ? "today's" :
              selectedTab === 'active' ? 'active' :
              selectedTab === 'completed' ? 'completed' : 'cancelled'} reminders</p>
          </div>
        ) : (
          <div className="reminders-list">
            <h3 className="section-title">
              {selectedTab === 'upcoming' ? 'Upcoming' :
               selectedTab === 'today' ? "Today's" :
               selectedTab === 'active' ? 'Active' :
               selectedTab === 'completed' ? 'Completed' : 'Cancelled'} Reminders
            </h3>
            
            <div className="reminder-cards">
              {reminders.map(reminder => (
                <div className="reminder-card" key={reminder.id}>
                  <div className="reminder-header">
                    <h4 className="reminder-title">{reminder.title}</h4>
                    <div className="reminder-actions">
                      {reminder.status === 'active' && (
                        <>
                          <button
                            className="action-button"
                            onClick={() => handleEdit(reminder)}
                            title="Edit reminder"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="action-button"
                            onClick={() => handleComplete(reminder.id)}
                            title="Mark as completed"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button
                            className="action-button"
                            onClick={() => handleCancel(reminder.id)}
                            title="Cancel reminder"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </>
                      )}
                      {(reminder.status === 'completed' || reminder.status === 'cancelled') && (
                        <button
                          className="action-button delete"
                          onClick={() => handleDelete(reminder.id)}
                          title="Delete reminder"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="reminder-time">
                    <FontAwesomeIcon icon={faCalendarAlt} /> {formatDateTime(reminder.reminder_time)}
                    {reminder.repeat_type !== 'once' && (
                      <span className="repeat-type"> (Repeat: {getRepeatTypeText(reminder.repeat_type)}
                        {reminder.repeat_days && ` - ${reminder.repeat_days}`})
                      </span>
                    )}
                  </div>
                  
                  {reminder.description && (
                    <div className="reminder-description">{reminder.description}</div>
                  )}
                  
                  {(reminder.route_details || reminder.from_stop_details || reminder.to_stop_details) && (
                    <div className="reminder-route-info">
                      {reminder.route_details && (
                        <div>
                          <FontAwesomeIcon icon={faRoute} /> Route: {reminder.route_details.route_number} - {reminder.route_details.name}
                        </div>
                      )}
                      {(reminder.from_stop_details || reminder.to_stop_details) && (
                        <div className="reminder-stops">
                          {reminder.from_stop_details && (
                            <span>
                              <FontAwesomeIcon icon={faMapMarkerAlt} /> From: {reminder.from_stop_details.name}
                            </span>
                          )}
                          {reminder.to_stop_details && (
                            <span>
                              <FontAwesomeIcon icon={faMapMarkerAlt} /> To: {reminder.to_stop_details.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="reminder-meta">
                    Advance notice: {reminder.advance_notice} minutes
                    {reminder.status !== 'active' && (
                      <span className={`reminder-status ${reminder.status}`}>
                        {reminder.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    )}
                  </div>
                  
                  <div className="reminder-card-actions">
                    {reminder.status === 'active' && (
                      <>
                        <button className="action-button" onClick={() => handleEdit(reminder)}>
                          <FontAwesomeIcon icon={faEdit} />
                          <span>Edit</span>
                        </button>
                        <button className="action-button" onClick={() => handleComplete(reminder.id)}>
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Complete</span>
                        </button>
                        <button className="action-button" onClick={() => handleCancel(reminder.id)}>
                          <FontAwesomeIcon icon={faTimes} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderPage; 