import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/NewsPage.css";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNews, setFilteredNews] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === "admin@mineflow.com");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsRef = collection(db, "news");
        const q = query(newsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const newsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNews(newsData);
        setFilteredNews(newsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load news.");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const results = news.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNews(results);
  }, [searchTerm, news]);

  const handlePostNews = async () => {
    if (!title || !content) {
      setError("Title and Content are required.");
      return;
    }

    const newNews = {
      title,
      content,
      category,
      imageUrl,
      author: user.email,
      timestamp: Timestamp.now(),
    };

    try {
      if (editMode && editId) {
        await deleteDoc(doc(db, "news", editId));
      }
      const docRef = await addDoc(collection(db, "news"), newNews);
      setNews([{ id: docRef.id, ...newNews }, ...news]);
      setTitle("");
      setContent("");
      setImageUrl("");
      setCategory("General");
      setEditMode(false);
      setEditId(null);
      setError("");
      alert("News saved successfully.");
    } catch (err) {
      setError("Error saving news.");
    }
  };

  const handleEdit = (newsItem) => {
    setTitle(newsItem.title);
    setContent(newsItem.content);
    setCategory(newsItem.category);
    setImageUrl(newsItem.imageUrl);
    setEditMode(true);
    setEditId(newsItem.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      await deleteDoc(doc(db, "news", id));
      setNews(news.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="news-container">
      <h1>📰 Latest News</h1>

      <input
        type="text"
        placeholder="Search news..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="news-search"
      />

      {isAdmin && (
        <div className="news-form">
          <h2>{editMode ? "Edit News" : "Add News"}</h2>
          <input
            type="text"
            placeholder="News Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="News Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>General</option>
            <option>Updates</option>
            <option>Security</option>
            <option>Opportunities</option>
          </select>
          <button onClick={handlePostNews}>{editMode ? "Update News" : "Post News"}</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {loading ? (
        <p>Loading news...</p>
      ) : (
        <div className="news-list">
          {filteredNews.map((item) => (
            <div key={item.id} className="news-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <span className="news-meta">
                Posted by {item.author} | {item.category} | {" "}
                {item.timestamp?.toDate().toLocaleString()}
              </span>
              {isAdmin && (
                <div className="admin-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
