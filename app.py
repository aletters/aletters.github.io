from flask import Flask, render_template_string, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///checklist.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# HTML Template with embedded CSS and JavaScript
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Checklist</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
            height: 10px;
            margin-top: 15px;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #4ade80;
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 0.85em;
            color: #6c757d;
        }
        
        .add-form {
            display: flex;
            padding: 20px;
            gap: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .add-form input {
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }
        
        .add-form input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .add-form button {
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .add-form button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .checklist {
            list-style: none;
            padding: 0;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .checklist-item {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #f1f3f4;
            transition: background 0.2s;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .checklist-item:hover {
            background: #f8f9fa;
        }
        
        .checklist-item.completed .item-text {
            text-decoration: line-through;
            color: #adb5bd;
        }
        
        .checkbox {
            width: 22px;
            height: 22px;
            border: 2px solid #667eea;
            border-radius: 6px;
            margin-right: 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .checkbox:hover {
            background: #f0f0ff;
        }
        
        .checklist-item.completed .checkbox {
            background: #667eea;
            border-color: #667eea;
        }
        
        .checkbox::after {
            content: '✓';
            color: white;
            font-size: 14px;
            display: none;
        }
        
        .checklist-item.completed .checkbox::after {
            display: block;
        }
        
        .item-text {
            flex: 1;
            font-size: 1em;
            color: #333;
        }
        
        .delete-btn {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            font-size: 1.2em;
            padding: 5px 10px;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .checklist-item:hover .delete-btn {
            opacity: 1;
        }
        
        .delete-btn:hover {
            color: #c82333;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #adb5bd;
        }
        
        .empty-state svg {
            width: 80px;
            height: 80px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .actions {
            display: flex;
            justify-content: space-between;
            padding: 15px 20px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        
        .action-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.2s;
        }
        
        .clear-completed {
            background: #e9ecef;
            color: #495057;
        }
        
        .clear-completed:hover {
            background: #dee2e6;
        }
        
        .clear-all {
            background: #fee2e2;
            color: #dc3545;
        }
        
        .clear-all:hover {
            background: #fecaca;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 My Checklist</h1>
            <p>Stay organized and productive</p>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: {{ progress }}%"></div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">{{ total }}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{{ completed }}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{{ remaining }}</div>
                <div class="stat-label">Remaining</div>
            </div>
        </div>
        
        <form class="add-form" id="addForm">
            <input type="text" id="itemInput" placeholder="Add a new task..." required>
            <button type="submit">Add</button>
        </form>
        
        <ul class="checklist" id="checklist">
            {% if items %}
                {% for item in items %}
                    <li class="checklist-item {% if item.completed %}completed{% endif %}" data-id="{{ item.id }}">
                        <div class="checkbox" onclick="toggleItem({{ item.id }})"></div>
                        <span class="item-text">{{ item.text }}</span>
                        <button class="delete-btn" onclick="deleteItem({{ item.id }})">×</button>
                    </li>
                {% endfor %}
            {% else %}
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                    <p>No tasks yet. Add one above!</p>
                </div>
            {% endif %}
        </ul>
        
        <div class="actions">
            <button class="action-btn clear-completed" onclick="clearCompleted()">Clear Completed</button>
            <button class="action-btn clear-all" onclick="clearAll()">Clear All</button>
        </div>
    </div>
    
    <script>
        function toggleItem(id) {
            fetch('/toggle/' + id, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
        }
        
        function deleteItem(id) {
            fetch('/delete/' + id, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
        }
        
        function clearCompleted() {
            fetch('/clear_completed', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
        }
        
        function clearAll() {
            if (confirm('Are you sure you want to delete all items?')) {
                fetch('/clear_all', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        }
                    });
            }
        }
        
        document.getElementById('addForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('itemInput');
            const text = input.value.trim();
            
            if (text) {
                fetch('/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: text })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
            }
        });
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    items = Item.query.order_by(Item.created_at.desc()).all()
    total = len(items)
    completed = sum(1 for item in items if item.completed)
    remaining = total - completed
    progress = (completed / total * 100) if total > 0 else 0
    
    return render_template_string(HTML_TEMPLATE, 
                                  items=items, 
                                  total=total, 
                                  completed=completed, 
                                  remaining=remaining, 
                                  progress=progress)

@app.route('/add', methods=['POST'])
def add_item():
    data = request.get_json()
    text = data.get('text', '').strip()
    
    if text:
        item = Item(text=text)
        db.session.add(item)
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({'success': False}), 400

@app.route('/toggle/<int:item_id>', methods=['POST'])
def toggle_item(item_id):
    item = Item.query.get_or_404(item_id)
    item.completed = not item.completed
    db.session.commit()
    return jsonify({'success': True})

@app.route('/delete/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/clear_completed', methods=['POST'])
def clear_completed():
    Item.query.filter_by(completed=True).delete()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/clear_all', methods=['POST'])
def clear_all():
    Item.query.delete()
    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    print("🚀 Starting Interactive Checklist App...")
    print("📍 Open your browser and go to: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    app.run(debug=True, host='0.0.0.0', port=5000)
