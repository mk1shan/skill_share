import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Chip,
  Badge
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  MoreVert,
  Edit,
  Delete,
  Share,
  BookmarkBorder,
  Bookmark,
  Image,
  Send,
  EmojiEmotions
} from '@mui/icons-material';
import { firestore, auth } from '../firebase'; // Import Firestore and Auth instances
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';

// Enhanced color palette
const colors = {
  darkest: '#051F20',
  dark: '#0B2B26',
  medium: '#163832',
  regular: '#235347',
  light: '#8EB69B',
  lightest: '#DAF1DE',
  overlay: 'rgba(5, 31, 32, 0.8)',
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState(''); // New state for post title
  const [selectedPost, setSelectedPost] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentPostId, setCommentPostId] = useState(null); // Track the post ID for the comment
  const [currentUser, setCurrentUser] = useState(null); // Track the current user

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: user.uid,
            name: userData.name,
            avatar: userData.avatar || '/api/placeholder/40/40'
          });
        }
      }
    };

    const fetchPosts = async () => {
      const q = query(collection(firestore, 'posts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate().toLocaleString() // Convert Firestore timestamp to readable string
        };
      });
      setPosts(postsData);
    };

    fetchUserProfile();
    fetchPosts();
  }, []);

  const handlePostMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handlePostMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleLike = async (postId) => {
    const postRef = doc(firestore, 'posts', postId);
    const post = posts.find(post => post.id === postId);
    const isLiked = !post.isLiked;
    await updateDoc(postRef, {
      isLiked,
      likes: isLiked ? post.likes + 1 : post.likes - 1
    });
    setPosts(posts.map(post => post.id === postId ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 } : post));
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    const postRef = doc(firestore, 'posts', postId);
    const post = posts.find(post => post.id === postId);
    const newComment = {
      id: Date.now(),
      author: currentUser,
      content: commentText,
      timestamp: new Date().toLocaleString(), // Convert to readable string
      likes: 0
    };
    await updateDoc(postRef, {
      comments: [...post.comments, newComment]
    });
    setPosts(posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post));
    setCommentText('');
    setCommentPostId(null); // Reset the comment post ID
  };

  const handleEdit = (post) => {
    handlePostMenuClose();
    setPosts(posts.map(p => p.id === post.id ? { ...p, isEditing: true } : p));
  };

  const handleSave = async (postId, newContent) => {
    if (typeof newContent !== 'string') {
      console.error('Invalid content type:', newContent);
      return;
    }

    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      content: newContent,
      isEditing: false
    });
    setPosts(posts.map(post => post.id === postId ? { ...post, content: newContent, isEditing: false } : post));
  };

  const handleDelete = async (postId) => {
    handlePostMenuClose();
    await deleteDoc(doc(firestore, 'posts', postId));
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleBookmark = async (postId) => {
    const postRef = doc(firestore, 'posts', postId);
    const post = posts.find(post => post.id === postId);
    await updateDoc(postRef, {
      isBookmarked: !post.isBookmarked
    });
    setPosts(posts.map(post => post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post));
  };

  const handleNewPost = async () => {
    if (!newPost.trim() || !newTitle.trim()) return;
    const newPostData = {
      author: currentUser,
      title: newTitle, // Add title to post data
      content: newPost,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: [],
      isLiked: false,
      isBookmarked: false,
      isEditing: false,
      tags: []
    };
    const docRef = await addDoc(collection(firestore, 'posts'), newPostData);
    setPosts([{ id: docRef.id, ...newPostData, timestamp: new Date().toLocaleString() }, ...posts]);
    setNewPost('');
    setNewTitle(''); // Reset title input
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* New Post Creation Card */}
      <Card sx={{ 
        mb: 4, 
        backgroundColor: colors.lightest,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Avatar src={currentUser?.avatar} />
            <TextField
              fullWidth
              placeholder="Title"
              variant="outlined"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: colors.medium,
                    }
                  }
                }
              }}
            />
            <TextField
              fullWidth
              placeholder="What's on your mind?"
              variant="outlined"
              multiline
              minRows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: colors.medium,
                    }
                  }
                }
              }}
            />
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2 
          }}>
            <Box>
              <IconButton>
                <Image color="primary" />
              </IconButton>
              <IconButton>
                <EmojiEmotions color="primary" />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              startIcon={<Send />}
              disabled={!newPost.trim() || !newTitle.trim()}
              onClick={handleNewPost}
              sx={{
                bgcolor: colors.regular,
                '&:hover': {
                  bgcolor: colors.medium,
                },
                borderRadius: '12px',
                textTransform: 'none'
              }}
            >
              Post
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map(post => (
        <Card 
          key={post.id} 
          sx={{ 
            mb: 4, 
            bgcolor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardHeader
            avatar={
              <Avatar src={post.author.avatar} />
            }
            action={
              post.author.id === currentUser?.id && (
                <IconButton onClick={(e) => handlePostMenuOpen(e, post)}>
                  <MoreVert />
                </IconButton>
              )
            }
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {post.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.author.name}
                  </Typography>
                  {post.author.isVerified && (
                    <Tooltip title="Verified User">
                      <Badge color="primary" variant="dot" />
                    </Tooltip>
                  )}
                </Box>
              </Box>
            }
            subheader={post.timestamp}
          />

          <CardContent>
            {post.isEditing ? (
              <TextField
                fullWidth
                multiline
                defaultValue={post.content}
                variant="outlined"
                onBlur={(e) => handleSave(post.id, e.target.value)}
                sx={{ mb: 2 }}
              />
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {post.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        bgcolor: `${colors.light}20`,
                        color: colors.dark,
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
            
            {post.images?.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                sx={{
                  width: '100%',
                  borderRadius: '12px',
                  mt: 2
                }}
              />
            ))}
          </CardContent>

          <CardActions sx={{ px: 2, py: 1 }}>
            <IconButton onClick={() => handleLike(post.id)}>
              {post.isLiked ? (
                <Favorite sx={{ color: '#ef4444' }} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {post.likes}
            </Typography>
            
            <IconButton onClick={() => setCommentPostId(post.id)}>
              <Comment />
            </IconButton>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {post.comments.length}
            </Typography>

            <IconButton onClick={() => handleBookmark(post.id)}>
              {post.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>

            <IconButton>
              <Share />
            </IconButton>
          </CardActions>

          <Divider />

          {/* Comments Section */}
          <Box sx={{ p: 2 }}>
            {post.comments.map(comment => (
              <Box key={comment.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Avatar
                    src={comment.author.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Box
                    sx={{
                      bgcolor: colors.lightest,
                      p: 1.5,
                      borderRadius: '12px',
                      flexGrow: 1
                    }}
                  >
                    <Typography variant="subtitle2">
                      {comment.author.name}
                    </Typography>
                    <Typography variant="body2">
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {comment.timestamp}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ cursor: 'pointer', '&:hover': { color: colors.medium } }}
                  >
                    Reply
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* New Comment Input */}
            {commentPostId === post.id && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Avatar
                  src={currentUser?.avatar}
                  sx={{ width: 32, height: 32 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText.trim()}
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      bgcolor: colors.lightest,
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Card>
      ))}

      {/* Post Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePostMenuClose}
        PaperProps={{
          sx: {
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem onClick={() => handleEdit(selectedPost)}>
          <Edit sx={{ mr: 1 }} /> Edit Post
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedPost?.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete Post
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Feed;
