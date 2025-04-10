import React, { useEffect, useState } from "react";
import "../Appcss/MiningTools.css";
import { FaSearch, FaStar, FaHeart, FaShareAlt, FaTools } from "react-icons/fa";

const dummyTools = [
  {
    id: 1,
    name: "CPU Miner Boost",
    description: "Boost mining performance using CPU optimization.",
    category: "Performance",
    rating: 4.8,
    isNew: true,
    link: "#",
  },
  {
    id: 2,
    name: "Web Auto Clicker",
    description: "Auto clicker for tasks & mining gamification.",
    category: "Automation",
    rating: 4.6,
    isNew: false,
    link: "#",
  },
  {
    id: 3,
    name: "Crypto Wallet Checker",
    description: "Monitor and audit your crypto wallet activity.",
    category: "Security",
    rating: 4.9,
    isNew: true,
    link: "#",
  },
  {
    id: 4,
    name: "GPU Overclock Assistant",
    description: "Safely tune GPU settings for optimal mining.",
    category: "Performance",
    rating: 4.5,
    isNew: false,
    link: "#",
  },
  // ... add more tools
];

const categories = ["All", "Performance", "Automation", "Security"];

const MiningTools = () => {
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXP] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setTools(dummyTools);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleToolClick = (tool) => {
    setXP((prevXP) => prevXP + 10);
    window.open(tool.link, "_blank");
  };

  const handleShare = (toolName) => {
    alert(`Share ${toolName} on social media! 🚀`);
  };

  const handleAdminUpload = () => {
    alert("Admin tool upload placeholder!");
  };

  return (
    <div className="tools-container">
      <div className="header">
        <h1>
          <FaTools /> Mining Tools Center
        </h1>
        <p>🔥 Explore advanced tools that power your mining journey!</p>
      </div>

      <div className="search-bar">
        <FaSearch className="icon" />
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={cat === selectedCategory ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="xp-tracker">🧠 XP Earned: {xp}</div>

      <div className="admin-panel">
        <button onClick={handleAdminUpload}>+ Upload Tool (Admin Only)</button>
      </div>

      {loading ? (
        <div className="loader">Loading tools...</div>
      ) : filteredTools.length > 0 ? (
        <div className="tools-grid">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="tool-card">
              {tool.isNew && <span className="badge-new">New</span>}
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
              <div className="tool-meta">
                <span className="rating">
                  <FaStar /> {tool.rating}
                </span>
                <span className="category">{tool.category}</span>
              </div>
              <div className="tool-actions">
                <button onClick={() => handleToolClick(tool)}>Open Tool</button>
                <FaHeart
                  className={`favorite ${favorites.includes(tool.id) ? "liked" : ""}`}
                  onClick={() => toggleFavorite(tool.id)}
                />
                <FaShareAlt className="share" onClick={() => handleShare(tool.name)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">No tools found for your search.</p>
      )}
    </div>
  );
};

export default MiningTools;
