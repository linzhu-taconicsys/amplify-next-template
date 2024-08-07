"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react'
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

function AddTodoModal({ isOpen, onAdd }) {
  const [content, setTodoContent] = useState('');

  function handleInputChange(e) {
    setTodoContent(e.target.value);
  };

  function handleAddTodo() {
    onAdd(content);  
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <input type="text" value={content} onChange={handleInputChange} style={{ margin: '10px 15px' }} />
        <button onClick={handleAddTodo} style={{ margin: '10px 15px' }}>Add Todo</button>
      </div>
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function openAddTodoModal() {
    setIsModalOpen(true);
  };

  function handleAddTodo(content: string) {
    setIsModalOpen(false);
    client.models.Todo.create({ content })
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={openAddTodoModal}>+ new</button>
          {isModalOpen && <AddTodoModal isOpen={isModalOpen} onAdd={handleAddTodo} />}
          <ul>
            {todos.map((todo) => (
              <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
              Review next steps of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
