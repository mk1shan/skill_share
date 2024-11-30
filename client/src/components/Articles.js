import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { Container, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const Articles = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const articlesCollection = collection(firestore, 'articles');
      const articlesSnapshot = await getDocs(articlesCollection);
      const articlesList = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(articlesList);
    };

    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newArticle = {
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(firestore, 'articles'), newArticle);
      setArticles([...articles, newArticle]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Write an Article</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" color="primary">Submit</Button>
      </form>
      <Typography variant="h5" gutterBottom>Articles</Typography>
      <List>
        {articles.map(article => (
          <ListItem key={article.id}>
            <ListItemText
              primary={article.title}
              secondary={article.content}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Articles;
