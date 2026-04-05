import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronRight, 
  CheckSquare, 
  Square,
  Settings,
  X,
  Image as ImageIcon,
  List,
  CheckCircle2,
  Palette
} from 'lucide-react';
import './App.css';

// Color palettes for themes
const colorPalettes = {
  lavender: {
    name: 'Lavender Dreams',
    colors: {
      '--bg-primary': '#faf5ff',
      '--bg-secondary': '#f3e8ff',
      '--bg-card': '#ffffff',
      '--text-primary': '#4c1d95',
      '--text-secondary': '#7c3aed',
      '--accent': '#a855f7',
      '--accent-hover': '#9333ea',
      '--border': '#e9d5ff',
    }
  },
  rose: {
    name: 'Rose Garden',
    colors: {
      '--bg-primary': '#fff5f7',
      '--bg-secondary': '#ffe4e6',
      '--bg-card': '#ffffff',
      '--text-primary': '#881337',
      '--text-secondary': '#be123c',
      '--accent': '#fb7185',
      '--accent-hover': '#e11d48',
      '--border': '#fecdd3',
    }
  },
  mint: {
    name: 'Mint Breeze',
    colors: {
      '--bg-primary': '#f0fdfa',
      '--bg-secondary': '#ccfbf1',
      '--bg-card': '#ffffff',
      '--text-primary': '#134e4a',
      '--text-secondary': '#14b8a6',
      '--accent': '#2dd4bf',
      '--accent-hover': '#0d9488',
      '--border': '#99f6e4',
    }
  },
  peach: {
    name: 'Peach Blossom',
    colors: {
      '--bg-primary': '#fff7ed',
      '--bg-secondary': '#ffedd5',
      '--bg-card': '#ffffff',
      '--text-primary': '#7c2d12',
      '--text-secondary': '#ea580c',
      '--accent': '#fb923c',
      '--accent-hover': '#f97316',
      '--border': '#fed7aa',
    }
  },
  sky: {
    name: 'Sky Serenity',
    colors: {
      '--bg-primary': '#f0f9ff',
      '--bg-secondary': '#e0f2fe',
      '--bg-card': '#ffffff',
      '--text-primary': '#0c4a6e',
      '--text-secondary': '#0284c7',
      '--accent': '#38bdf8',
      '--accent-hover': '#0ea5e9',
      '--border': '#bae6fd',
    }
  }
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial sample data
const initialLists = [
  {
    id: generateId(),
    title: 'Self Care Sunday ✨',
    collapsed: false,
    items: [
      {
        id: generateId(),
        text: 'Morning skincare routine',
        completed: false,
        description: 'Cleanse, tone, moisturize, and don\'t forget SPF!',
        imageUrl: '',
        subItems: []
      },
      {
        id: generateId(),
        text: 'Meditation session',
        completed: true,
        description: '15 minutes of mindfulness',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=150&fit=crop',
        subItems: [
          { id: generateId(), text: 'Guided meditation', completed: false, description: '', imageUrl: '', subItems: [] },
          { id: generateId(), text: 'Breathing exercises', completed: false, description: '', imageUrl: '', subItems: [] }
        ]
      }
    ]
  }
];

function App() {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('checklist-data');
    return saved ? JSON.parse(saved) : initialLists;
  });
  
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('checklist-theme') || 'lavender';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('checklist-data', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('checklist-theme', currentTheme);
    applyTheme(currentTheme);
  }, [currentTheme]);

  const applyTheme = (themeName) => {
    const palette = colorPalettes[themeName];
    if (palette) {
      Object.entries(palette.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  // Apply initial theme
  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  // CRUD Operations for Lists
  const createList = () => {
    if (!newListTitle.trim()) return;
    const newList = {
      id: generateId(),
      title: newListTitle.trim(),
      collapsed: false,
      items: []
    };
    setLists([...lists, newList]);
    setNewListTitle('');
    setShowCreateList(false);
  };

  const updateList = (listId, updates) => {
    setLists(lists.map(list => 
      list.id === listId ? { ...list, ...updates } : list
    ));
  };

  const deleteList = (listId) => {
    setLists(lists.filter(list => list.id !== listId));
  };

  // CRUD Operations for Items
  const addItem = (listId, parentId = null) => {
    const newItem = {
      id: generateId(),
      text: 'New item',
      completed: false,
      description: '',
      imageUrl: '',
      subItems: []
    };

    setLists(lists.map(list => {
      if (list.id !== listId) return list;
      
      if (!parentId) {
        return { ...list, items: [...list.items, newItem] };
      }
      
      // Add as subitem
      const addSubItem = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return { ...item, subItems: [...item.subItems, newItem] };
          }
          if (item.subItems.length > 0) {
            return { ...item, subItems: addSubItem(item.subItems) };
          }
          return item;
        });
      };
      
      return { ...list, items: addSubItem(list.items) };
    }));
  };

  const updateItem = (listId, itemId, updates) => {
    setLists(lists.map(list => {
      if (list.id !== listId) return list;
      
      const updateInItems = (items) => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, ...updates };
          }
          if (item.subItems.length > 0) {
            return { ...item, subItems: updateInItems(item.subItems) };
          }
          return item;
        });
      };
      
      return { ...list, items: updateInItems(list.items) };
    }));
  };

  const deleteItem = (listId, itemId) => {
    setLists(lists.map(list => {
      if (list.id !== listId) return list;
      
      const filterFromItems = (items) => {
        return items.filter(item => item.id !== itemId).map(item => ({
          ...item,
          subItems: filterFromItems(item.subItems)
        }));
      };
      
      return { ...list, items: filterFromItems(list.items) };
    }));
  };

  // Toggle item completion
  const toggleComplete = (listId, itemId) => {
    setLists(lists.map(list => {
      if (list.id !== listId) return list;
      
      const toggleInItems = (items) => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          if (item.subItems.length > 0) {
            return { ...item, subItems: toggleInItems(item.subItems) };
          }
          return item;
        });
      };
      
      return { ...list, items: toggleInItems(list.items) };
    }));
  };

  // Toggle all items in a nested list
  const toggleAllSubItems = (listId, parentId, complete) => {
    setLists(lists.map(list => {
      if (list.id !== listId) return list;
      
      const updateSubItems = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              subItems: item.subItems.map(sub => ({ ...sub, completed: complete }))
            };
          }
          if (item.subItems.length > 0) {
            return { ...item, subItems: updateSubItems(item.subItems) };
          }
          return item;
        });
      };
      
      return { ...list, items: updateSubItems(list.items) };
    }));
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <CheckCircle2 size={32} />
            <h1>Aesthetic Checklists</h1>
          </div>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Create New List Button */}
        {!showCreateList ? (
          <button 
            className="create-list-btn"
            onClick={() => setShowCreateList(true)}
          >
            <Plus size={24} />
            <span>Create New List</span>
          </button>
        ) : (
          <div className="create-list-form">
            <input
              type="text"
              placeholder="Enter list title..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createList()}
              autoFocus
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={createList}>
                <CheckSquare size={18} />
                Create
              </button>
              <button className="btn-secondary" onClick={() => setShowCreateList(false)}>
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Lists Board */}
        <div className="lists-board">
          {lists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              onUpdateList={updateList}
              onDeleteList={deleteList}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onToggleComplete={toggleComplete}
              onToggleAllSubItems={toggleAllSubItems}
            />
          ))}
        </div>

        {lists.length === 0 && (
          <div className="empty-state">
            <List size={64} />
            <h2>No lists yet!</h2>
            <p>Create your first aesthetic checklist to get started ✨</p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// List Card Component
function ListCard({ 
  list, 
  onUpdateList, 
  onDeleteList, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  onToggleComplete,
  onToggleAllSubItems
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateList(list.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const allSubItemsChecked = (items) => {
    const allChecked = (item) => {
      if (item.subItems.length === 0) return true;
      return item.subItems.every(sub => sub.completed && allChecked(sub));
    };
    return items.every(allChecked);
  };

  const hasSubItems = (items) => {
    return items.some(item => item.subItems.length > 0 || hasSubItems(item.subItems));
  };

  return (
    <div className={`list-card ${list.collapsed ? 'collapsed' : ''}`}>
      <div className="list-header">
        <button 
          className="collapse-btn"
          onClick={() => onUpdateList(list.id, { collapsed: !list.collapsed })}
        >
          {list.collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            className="list-title-input"
          />
        ) : (
          <h2 className="list-title">{list.title}</h2>
        )}
        
        <div className="list-actions">
          <button 
            className="action-btn"
            onClick={() => setIsEditing(true)}
            title="Edit title"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="action-btn"
            onClick={() => onAddItem(list.id)}
            title="Add item"
          >
            <Plus size={16} />
          </button>
          <button 
            className="action-btn danger"
            onClick={() => onDeleteList(list.id)}
            title="Delete list"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!list.collapsed && (
        <div className="list-items">
          {list.items.map(item => (
            <ListItem
              key={item.id}
              item={item}
              listId={list.id}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onToggleComplete={onToggleComplete}
              onAddItem={onAddItem}
              onToggleAllSubItems={onToggleAllSubItems}
              depth={0}
            />
          ))}
          
          {list.items.length === 0 && (
            <div className="empty-list">
              <p>No items yet. Click + to add your first item!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// List Item Component
function ListItem({ 
  item, 
  listId, 
  onUpdateItem, 
  onDeleteItem, 
  onToggleComplete,
  onAddItem,
  onToggleAllSubItems,
  depth 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDetails, setShowDetails] = useState(false);
  const [editDescription, setEditDescription] = useState(item.description);
  const [editImageUrl, setEditImageUrl] = useState(item.imageUrl);

  const handleSaveText = () => {
    if (editText.trim()) {
      onUpdateItem(listId, item.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleSaveDetails = () => {
    onUpdateItem(listId, item.id, { 
      description: editDescription,
      imageUrl: editImageUrl 
    });
    setShowDetails(false);
  };

  const hasSubItems = item.subItems.length > 0;
  const allSubItemsChecked = item.subItems.every(sub => sub.completed);

  return (
    <div className={`list-item ${depth > 0 ? 'sub-item' : ''}`} style={{ marginLeft: `${depth * 24}px` }}>
      <div className="item-content">
        <button 
          className="checkbox-btn"
          onClick={() => onToggleComplete(listId, item.id)}
        >
          {item.completed ? (
            <CheckSquare size={20} className="checked" />
          ) : (
            <Square size={20} />
          )}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveText}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveText()}
            autoFocus
            className="item-text-input"
          />
        ) : (
          <span 
            className={`item-text ${item.completed ? 'completed' : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {item.text}
          </span>
        )}

        {hasSubItems && (
          <div className="sub-item-controls">
            <button
              className="tiny-btn"
              onClick={() => onToggleAllSubItems(listId, item.id, !allSubItemsChecked)}
              title={allSubItemsChecked ? 'Uncheck all' : 'Check all'}
            >
              {allSubItemsChecked ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          </div>
        )}

        <div className="item-actions">
          <button 
            className="icon-btn"
            onClick={() => setShowDetails(!showDetails)}
            title="Edit details"
          >
            <Edit3 size={14} />
          </button>
          <button 
            className="icon-btn"
            onClick={() => onAddItem(listId, item.id)}
            title="Add sub-item"
          >
            <Plus size={14} />
          </button>
          <button 
            className="icon-btn danger"
            onClick={() => onDeleteItem(listId, item.id)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="item-details">
          <div className="detail-row">
            <label>Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
            />
          </div>
          <div className="detail-row">
            <label>Image URL</label>
            <div className="image-input-group">
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {editImageUrl && (
                <img 
                  src={editImageUrl} 
                  alt="Preview" 
                  className="image-preview"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          </div>
          <button className="btn-primary" onClick={handleSaveDetails}>
            Save Details
          </button>
        </div>
      )}

      {item.imageUrl && !showDetails && (
        <div className="item-image">
          <img src={item.imageUrl} alt="" onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}

      {hasSubItems && (
        <div className="sub-items">
          {item.subItems.map(subItem => (
            <ListItem
              key={subItem.id}
              item={subItem}
              listId={listId}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onToggleComplete={onToggleComplete}
              onAddItem={onAddItem}
              onToggleAllSubItems={onToggleAllSubItems}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ currentTheme, onThemeChange, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Palette size={24} />
            Choose Your Theme
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="theme-grid">
          {Object.entries(colorPalettes).map(([key, palette]) => (
            <button
              key={key}
              className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              onClick={() => onThemeChange(key)}
            >
              <div className="theme-preview">
                <div 
                  className="preview-color" 
                  style={{ backgroundColor: palette.colors['--bg-primary'] }}
                />
                <div 
                  className="preview-color" 
                  style={{ backgroundColor: palette.colors['--bg-secondary'] }}
                />
                <div 
                  className="preview-color" 
                  style={{ backgroundColor: palette.colors['--accent'] }}
                />
              </div>
              <span>{palette.name}</span>
              {currentTheme === key && <CheckCircle2 size={20} className="theme-check" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
