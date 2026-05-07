import React, { useState, useEffect } from 'react';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "5 Essential Tips for CBSE Political Science Board Exam Preparation",
      excerpt: "Discover proven strategies to score 90+ marks in Political Science board exams with these expert tips from 7+ years of teaching experience.",
      content: "Comprehensive guide covering exam patterns, important topics, study techniques, and time management strategies...",
      category: "Exam Preparation",
      date: "2024-03-15",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "Understanding Indian Federalism: A Student's Guide",
      excerpt: "Break down complex federalism concepts with real-world examples and exam-focused explanations for Class 12 students.",
      content: "Detailed explanation of federalism in Indian context with case studies and previous year questions...",
      category: "Study Material",
      date: "2024-03-10",
      readTime: "8 min read",
      featured: false
    },
    {
      id: 3,
      title: "Current Affairs Integration in Political Science",
      excerpt: "Learn how to effectively integrate current events with static syllabus for better exam performance and interview preparation.",
      content: "Strategic approach to linking current affairs with Political Science concepts...",
      category: "Current Affairs",
      date: "2024-03-05",
      readTime: "6 min read",
      featured: false
    },
    {
      id: 4,
      title: "Career Options After Political Science Honors",
      excerpt: "Explore diverse career paths available to Political Science graduates beyond traditional civil services.",
      content: "Comprehensive career guidance including government jobs, journalism, law, academia, and corporate roles...",
      category: "Career Guidance",
      date: "2024-02-28",
      readTime: "7 min read",
      featured: true
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Exam Preparation', 'Study Material', 'Current Affairs', 'Career Guidance'];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = posts.filter(post => post.featured);

  return (
    <section className="blog-section" aria-label="Blog Posts">
      <div className="container">
        <div className="blog-header">
          <h2>Political Science Blog & Resources</h2>
          <p>Expert insights, study tips, and career guidance for Political Science students</p>
        </div>

        {/* Featured Posts */}
        <div className="featured-posts">
          <h3>Featured Articles</h3>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <article key={post.id} className="featured-card">
                <div className="featured-content">
                  <span className="category-badge">{post.category}</span>
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="date">{post.date}</span>
                    <span className="read-time">{post.readTime}</span>
                  </div>
                  <button className="read-more-btn">Read More</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="blog-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search blog posts"
            />
          </div>
          <div className="category-filter">
            <label htmlFor="category-select">Category:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* All Posts */}
        <div className="all-posts">
          <h3>All Articles</h3>
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-content">
                  <span className="category-badge">{post.category}</span>
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="date">{post.date}</span>
                    <span className="read-time">{post.readTime}</span>
                  </div>
                  <button className="read-more-btn">Read More</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h3>Stay Updated with Latest Resources</h3>
            <p>Get weekly study tips, exam updates, and career guidance delivered to your inbox</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
