import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, rentalsAPI, userMessagesAPI } from '../services/api'; // Changed from messagesAPI to userMessagesAPI

const Profile = () => {
  const [user, setUser] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  
  // Messaging states
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching user profile data...');
        
        const userResponse = await authAPI.getProfile();
        console.log('✅ User profile response:', userResponse);
        console.log('👤 User data:', userResponse.data);
        setUser(userResponse.data);
        setUpdatedUser(userResponse.data);

        console.log('🔄 Fetching user rentals...');
        const rentalsResponse = await rentalsAPI.getUserRentals();
        console.log('✅ Rentals response:', rentalsResponse);
        console.log('📋 Rentals data:', rentalsResponse.data);
        setRentals(rentalsResponse.data || []);
        
        // Fetch user messages
        await fetchUserMessages();
        
        // Fetch unread count
        await fetchUnreadCount();
        
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        console.error('🔧 Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [navigate]);

  const fetchUserMessages = async () => {
    try {
      setMessagesLoading(true);
      const response = await userMessagesAPI.getMyMessages(); // Updated to userMessagesAPI
      console.log('📥 User messages:', response.data);
      setMessages(response.data);
      organizeConversations(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await userMessagesAPI.getMyUnreadCount(); // Updated to userMessagesAPI
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const organizeConversations = (msgs) => {
    // Group messages by conversation (by subject)
    const convos = {};
    msgs.forEach(msg => {
      const key = msg.id; // Use message ID as conversation key
      if (!convos[key]) {
        convos[key] = {
          id: msg.id,
          subject: msg.subject,
          messages: [{
            id: msg.id,
            message: msg.message,
            createdAt: msg.createdAt,
            isFromUser: true,
            sender: 'You'
          }],
          lastMessage: {
            message: msg.message,
            createdAt: msg.createdAt
          },
          unread: !msg.isRead
        };
      }
      
      // Add replies to the conversation
      if (msg.replies && msg.replies.length > 0) {
        msg.replies.forEach(reply => {
          convos[key].messages.push({
            id: reply.id,
            message: reply.reply,
            createdAt: reply.createdAt,
            isFromUser: !reply.isFromAdmin,
            sender: reply.isFromAdmin ? 'Admin' : 'You'
          });
        });
        
        // Update last message
        const lastReply = msg.replies[msg.replies.length - 1];
        convos[key].lastMessage = {
          message: lastReply.reply,
          createdAt: lastReply.createdAt
        };
      }
      
      // Sort messages within conversation by date
      convos[key].messages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
    
    // Sort conversations by last message date
    const sortedConvos = Object.values(convos).sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
    
    setConversations(sortedConvos);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Updating profile...', updatedUser);
      await authAPI.updateProfile(updatedUser);
      setUser(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      // Send reply to existing conversation
      await userMessagesAPI.reply(selectedConversation.id, newMessage); // Updated to userMessagesAPI
      
      // Refresh messages to get the new reply
      await fetchUserMessages();
      await fetchUnreadCount();
      
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateNewMessage = async (e) => {
    e.preventDefault();
    if (!newMessageSubject.trim() || !newMessageText.trim()) return;
    
    setSendingMessage(true);
    try {
      await userMessagesAPI.create({ // Updated to userMessagesAPI
        subject: newMessageSubject,
        message: newMessageText
      });
      
      // Refresh messages
      await fetchUserMessages();
      await fetchUnreadCount();
      
      setShowNewMessageModal(false);
      setNewMessageSubject('');
      setNewMessageText('');
      
      // Show success message
      alert('Message sent successfully!');
      
    } catch (error) {
      console.error('Error creating message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // If conversation has unread messages, mark them as read
    if (conversation.unread) {
      try {
        // You might want to add an endpoint to mark conversation as read
        // For now, we'll just update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id ? { ...conv, unread: false } : conv
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <p className="text-red-600 mb-4">User not found or session expired.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user text-white text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {user.firstName || user.FirstName} {user.lastName || user.LastName}
                  </h2>
                  <p className="text-amber-600">{user.role || user.Role}</p>
                </div>
                
                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left py-2 px-3 rounded transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-user mr-2"></i>
                    Profile
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('rentals')}
                    className={`w-full text-left py-2 px-3 rounded transition-colors ${
                      activeTab === 'rentals' 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-car mr-2"></i>
                    My Rentals ({rentals.length})
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className={`w-full text-left py-2 px-3 rounded transition-colors relative ${
                      activeTab === 'messages' 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-comments mr-2"></i>
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                    <button 
                      onClick={() => setEditMode(!editMode)}
                      className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          value={updatedUser.firstName || updatedUser.FirstName || ''}
                          onChange={(e) => setUpdatedUser({...updatedUser, firstName: e.target.value})}
                          placeholder="First Name"
                          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required 
                        />
                        <input 
                          type="text" 
                          value={updatedUser.lastName || updatedUser.LastName || ''}
                          onChange={(e) => setUpdatedUser({...updatedUser, lastName: e.target.value})}
                          placeholder="Last Name"
                          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required 
                        />
                      </div>
                      <input 
                        type="email" 
                        value={updatedUser.email || updatedUser.Email || ''}
                        onChange={(e) => setUpdatedUser({...updatedUser, email: e.target.value})}
                        placeholder="Email"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled 
                      />
                      <input 
                        type="tel" 
                        value={updatedUser.phoneNumber || updatedUser.PhoneNumber || ''}
                        onChange={(e) => setUpdatedUser({...updatedUser, phoneNumber: e.target.value})}
                        placeholder="Phone Number"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input 
                        type="text" 
                        value={updatedUser.driverLicenseNumber || updatedUser.DriverLicenseNumber || ''}
                        onChange={(e) => setUpdatedUser({...updatedUser, driverLicenseNumber: e.target.value})}
                        placeholder="Driver License Number"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled 
                      />
                      <textarea 
                        value={updatedUser.address || updatedUser.Address || ''}
                        onChange={(e) => setUpdatedUser({...updatedUser, address: e.target.value})}
                        placeholder="Address"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
                      />
                      <button 
                        type="submit" 
                        className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <p><strong>First Name:</strong> {user.firstName || user.FirstName}</p>
                        <p><strong>Last Name:</strong> {user.lastName || user.LastName}</p>
                      </div>
                      <p><strong>Email:</strong> {user.email || user.Email}</p>
                      <p><strong>Phone:</strong> {user.phoneNumber || user.PhoneNumber}</p>
                      <p><strong>License:</strong> {user.driverLicenseNumber || user.DriverLicenseNumber}</p>
                      <p><strong>Address:</strong> {user.address || user.Address}</p>
                      <p><strong>Role:</strong> {user.role || user.Role}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rentals' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">My Rentals</h2>
                  {rentals.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-car text-gray-400 text-3xl"></i>
                      </div>
                      <p className="text-gray-600 mb-4">No rentals yet.</p>
                      <Link 
                        to="/cars" 
                        className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Book a car now!
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rentals.map(rental => (
                        <div key={rental.id || rental.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">
                                {rental.car?.make || rental.car?.Make} {rental.car?.model || rental.car?.Model}
                              </p>
                              <p className="text-gray-600">
                                {new Date(rental.pickupDate || rental.PickupDate).toLocaleDateString()} - {new Date(rental.returnDate || rental.ReturnDate).toLocaleDateString()}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  (rental.status || rental.Status) === 'Approved' ? 'bg-green-100 text-green-800' :
                                  (rental.status || rental.Status) === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  (rental.status || rental.Status) === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {rental.status || rental.Status || 'Pending'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-amber-600">
                                {formatPrice(rental.totalAmount || rental.TotalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                      <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        New Message
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                    {/* Conversations List */}
                    <div className="border-r border-gray-200 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <i className="fas fa-comments text-4xl mb-2 text-gray-300"></i>
                          <p>No messages yet</p>
                          <p className="text-sm mt-2">Click "New Message" to start a conversation</p>
                        </div>
                      ) : (
                        conversations.map(conv => (
                          <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv)}
                            className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              selectedConversation?.id === conv.id ? 'bg-amber-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-800">
                                {conv.subject}
                              </span>
                              {conv.unread && (
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage?.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(conv.lastMessage?.createdAt)}
                            </p>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-2 flex flex-col h-full">
                      {selectedConversation ? (
                        <>
                          {/* Chat Header */}
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">
                              {selectedConversation.subject}
                            </h3>
                          </div>

                          {/* Messages */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedConversation.messages.map((msg, index) => (
                              <div
                                key={index}
                                className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.isFromUser
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <p className="text-sm break-words">{msg.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    msg.isFromUser ? 'text-amber-100' : 'text-gray-500'
                                  }`}>
                                    {formatDate(msg.createdAt)} • {msg.sender}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Message Input */}
                          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                disabled={sendingMessage}
                              />
                              <button
                                type="submit"
                                disabled={sendingMessage || !newMessage.trim()}
                                className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
                              >
                                {sendingMessage ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-paper-plane"></i>
                                )}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <i className="fas fa-comment-dots text-5xl mb-3 text-gray-300"></i>
                            <p>Select a conversation to start chatting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">New Message</h3>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleCreateNewMessage}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newMessageSubject}
                    onChange={(e) => setNewMessageSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Question about my booking"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Type your message here..."
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewMessageModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
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

// Helper function to format price
const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'R 0';
  }
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export default Profile;