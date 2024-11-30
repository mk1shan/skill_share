import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Send,
  ArrowBack,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Done as DoneAllIcon,
} from '@mui/icons-material';
import { firestore } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

const socket = io('http://localhost:5000');

const colors = {
  darkest: '#051F20',
  dark: '#0B2B26',
  medium: '#163832',
  regular: '#235347',
  light: '#8EB69B',
  lightest: '#DAF1DE',
};

const Chat = ({ currentUser }) => {
  const { userId: targetUserId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !targetUserId) return;

    // Join user's room
    socket.emit('join', {
      userId: currentUser.uid,
      username: currentUser.displayName || currentUser.email
    });

    // Listen for messages
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, status: 'received' }]);
    });

    socket.on('typing_status', ({ userId, isTyping }) => {
      if (userId === targetUserId) {
        setTyping(isTyping);
      }
    });

    // Load user data and previous messages
    const loadData = async () => {
      try {
        // Load user data
        const userDoc = await getDoc(doc(firestore, 'users', targetUserId));
        if (userDoc.exists()) {
          setSelectedUser({ id: userDoc.id, ...userDoc.data() });
        }

        // Create chat room ID (always sorted to ensure consistency)
        const chatRoomId = [currentUser.uid, targetUserId].sort().join('_');

        // Subscribe to messages
        const messagesRef = collection(firestore, 'chats', chatRoomId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messageList = [];
          snapshot.forEach((doc) => {
            messageList.push({
              id: doc.id,
              ...doc.data(),
              status: 'sent' // Default status for loaded messages
            });
          });
          setMessages(messageList);
        });

        setLoading(false);
        return unsubscribe;
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    const unsubscribe = loadData();
    return () => {
      socket.off('receive_message');
      socket.off('typing_status');
      unsubscribe && unsubscribe();
    };
  }, [currentUser, targetUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      receiverId: selectedUser.id,
      message: message.trim(),
      timestamp: serverTimestamp(),
      status: 'sending'
    };

    try {
      // Store in Firestore
      const chatRoomId = [currentUser.uid, selectedUser.id].sort().join('_');
      const messagesRef = collection(firestore, 'chats', chatRoomId, 'messages');
      await addDoc(messagesRef, messageData);

      // Send through socket
      socket.emit('send_message', {
        ...messageData,
        timestamp: Date.now() // Use client timestamp for immediate display
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    socket.emit('typing', {
      userId: currentUser.uid,
      receiverId: selectedUser.id,
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        userId: currentUser.uid,
        receiverId: selectedUser.id,
        isTyping: false
      });
    }, 1000);
  };

  const MessageStatus = ({ status }) => {
    switch (status) {
      case 'sending':
        return <CheckIcon fontSize="small" sx={{ opacity: 0.5 }} />;
      case 'sent':
        return <CheckIcon fontSize="small" />;
      case 'delivered':
        return <DoneAllIcon fontSize="small" />;
      case 'read':
        return <DoneAllIcon fontSize="small" color="primary" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <Box sx={{ p: 2, bgcolor: colors.dark, color: colors.lightest }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton color="inherit" onClick={() => navigate('/search')}>
                <ArrowBack />
              </IconButton>
              {selectedUser && (
                <>
                  <Avatar src={selectedUser.avatar} alt={selectedUser.name}>
                    {selectedUser.name?.[0] || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{selectedUser.name}</Typography>
                    {typing && (
                      <Typography variant="caption" sx={{ color: colors.light }}>
                        typing...
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Stack>
            <IconButton color="inherit">
              <MoreIcon />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        {/* Messages Area */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2, 
            bgcolor: '#e5ded8',
            backgroundImage: 'url("/chat-bg.png")',
            backgroundRepeat: 'repeat'
          }}
        >
          {selectedUser ? (
            messages.map((msg, index) => (
              <Box
                key={msg.id || index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: msg.senderId === currentUser.uid ? '#dcf8c6' : 'white',
                    color: 'black',
                    borderRadius: 2,
                    position: 'relative'
                  }}
                >
                  <Typography variant="body1">{msg.message}</Typography>
                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    alignItems="center" 
                    justifyContent="flex-end"
                    sx={{ mt: 0.5, opacity: 0.7 }}
                  >
                    <Typography variant="caption">
                      {msg.timestamp?.toDate?.()?.toLocaleTimeString() || 
                       new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                    {msg.senderId === currentUser.uid && (
                      <MessageStatus status={msg.status} />
                    )}
                  </Stack>
                </Paper>
              </Box>
            ))
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="body1" color="text.secondary">
                Select a user from the search page to start chatting
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        {selectedUser && (
          <Box sx={{ p: 2, bgcolor: colors.dark }}>
            <form onSubmit={sendMessage}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.lightest,
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<Send />}
                  disabled={!message.trim()}
                  sx={{
                    bgcolor: colors.regular,
                    '&:hover': {
                      bgcolor: colors.medium,
                    }
                  }}
                >
                  Send
                </Button>
              </Stack>
            </form>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Chat;
