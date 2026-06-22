import React, { useState, useEffect } from 'react';
import { adminMessagesAPI } from '../../services/api';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

const MessagesManager = ({ stats, setStats }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter messages based on search and view mode
  useEffect(() => {
    let filtered = [...messages];
    
    // Apply view mode filter
    if (viewMode === 'unread') {
      filtered = filtered.filter(msg => !msg.isRead);
    } else if (viewMode === 'read') {
      filtered = filtered.filter(msg => msg.isRead);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [searchTerm, messages, viewMode]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminMessagesAPI.getAll();
      const data = response.data || [];
      
      console.log('📥 Messages loaded:', data);
      setMessages(data);
      
      // Update unread count in stats
      const unreadCount = data.filter(msg => !msg.isRead).length;
      if (setStats) {
        setStats(prev => ({ 
          ...prev, 
          totalMessages: data.length, 
          unreadMessages: unreadCount 
        }));
      }
      
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      setError(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await adminMessagesAPI.markAsRead(messageId);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Update unread count in stats
      const newUnreadCount = messages.filter(msg => !msg.isRead && msg.id !== messageId).length;
      if (setStats) {
        setStats(prev => ({ ...prev, unreadMessages: newUnreadCount }));
      }
      
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminMessagesAPI.delete(messageId);
      
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      
      // Update counts
      const unreadCount = updatedMessages.filter(msg => !msg.isRead).length;
      if (setStats) {
        setStats(prev => ({ 
          ...prev, 
          totalMessages: updatedMessages.length,
          unreadMessages: unreadCount 
        }));
      }
      
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      alert(error.response?.data?.message || 'Failed to delete message. Please try again.');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setReplyLoading(true);
    try {
      await adminMessagesAPI.reply({
        messageId: selectedMessage.id,
        reply: replyText
      });
      
      setShowReplyModal(false);
      setReplyText('');
      
      // Show success message
      alert('Reply sent successfully!');
      
      // Refresh messages to show reply
      await fetchMessages();
      
    } catch (error) {
      console.error('❌ Error sending reply:', error);
      alert(error.response?.data?.message || 'Failed to send reply. Please try again.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
    
    // Mark as read when viewing
    if (!message.isRead) {
      await handleMarkAsRead(message.id);
    }
  };

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If less than 24 hours, show relative time
      if (diffDays < 1) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours < 1) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      // Otherwise show formatted date
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getMessagePreview = (message, maxLength = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getSafeValue = (value, defaultValue = '') => {
    return value || defaultValue;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={fetchMessages}
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Customer Messages</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-amber-600 hover:text-amber-700 text-sm flex items-center"
            title="Refresh"
          >
            <i className={`fas fa-sync-alt mr-1 ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View mode filter */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('unread')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'unread'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Unread
              {stats?.unreadMessages > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('read')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'read'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Read
            </button>
          </div>

          <SearchBar 
            placeholder="Search messages..."
            onSearch={setSearchTerm}
            value={searchTerm}
            delay={500}
          />
          
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-envelope text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-amber-600">{stats?.unreadMessages || 0}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <i className="fas fa-envelope-open text-amber-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Replies Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.reduce((acc, msg) => acc + (msg.replies?.length || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-reply-all text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-500 text-lg">No messages found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Messages from the contact form will appear here'}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {getCurrentPageItems().map(message => (
                <li 
                  key={message.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !message.isRead ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        )}
                        <p className={`text-sm font-medium ${
                          !message.isRead ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {getSafeValue(message.name)}
                        </p>
                        <span className="text-xs text-gray-400">
                          <i className="far fa-clock mr-1"></i>
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-1">
                        <i className="far fa-envelope mr-1 text-gray-400"></i>
                        {getSafeValue(message.email)}
                      </p>
                      
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {getSafeValue(message.subject)}
                      </p>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {getMessagePreview(message.message)}
                      </p>
                      
                      {/* Show reply count if any */}
                      {message.replies && message.replies.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">
                          <i className="fas fa-reply mr-1"></i>
                          {message.replies.length} reply 
                          {message.replies.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="View and Reply"
                      >
                        <i className="fas fa-reply"></i>
                      </button>
                      
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                          title="Mark as Read"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredMessages.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of{' '}
                  {filteredMessages.length} messages
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredMessages.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Reply to Message</h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">From</span>
                  <p className="text-sm text-gray-800">{getSafeValue(selectedMessage.name)}</p>
                  <p className="text-xs text-gray-600">{getSafeValue(selectedMessage.email)}</p>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Subject</span>
                  <p className="text-sm text-gray-800">{getSafeValue(selectedMessage.subject)}</p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Original Message</span>
                  <p className="text-sm text-gray-700 mt-1 bg-white p-3 rounded border border-gray-200">
                    {getSafeValue(selectedMessage.message)}
                  </p>
                </div>

                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase">Previous Replies</span>
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="mt-2 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">
                          <i className="far fa-clock mr-1"></i>
                          {formatDate(reply.createdAt)} - by {getSafeValue(reply.repliedBy)}
                        </p>
                        <p className="text-sm text-gray-700">{getSafeValue(reply.reply)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleReply}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Type your reply here..."
                    required
                    autoFocus
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    This reply will be sent to {getSafeValue(selectedMessage.email)}
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={replyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading || !replyText.trim()}
                    className={`px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center ${
                      (replyLoading || !replyText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {replyLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManager;