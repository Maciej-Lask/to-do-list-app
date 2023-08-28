import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import shortid from 'shortid';
const App = () => {
  const [socket, setSocket] = useState();
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    const socket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socket);

    socket.on('addTask', (newTask) => {
      addTask(newTask);
    });

    socket.on('removeTask', (taskId) => {
      removeTask(taskId, false);
    });

    socket.on('updateData', (updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const removeTask = useCallback(
    (taskId, isDataLocal = true) => {
      setTasks((oldTasks) => {
        const updatedTasks = oldTasks.filter((task) => task.id !== taskId);
        // console.log(updatedTasks);
        if (isDataLocal) {
          socket.emit('removeTask', taskId);
        }
        return updatedTasks;
      });
    },
    [socket]
  );

  const handleTaskNameChange = (event) => {
    setTaskName(event.target.value);
  };

  const submitForm = (event) => {
    event.preventDefault();

    const taskId = shortid.generate();
    const newTask = {
      id: taskId,
      data: taskName,
    };
    addTask(newTask);
    setTaskName('');
    socket.emit('addTask', newTask);
  };

  const addTask = (newTask) => {
    setTasks((tasks) => [...tasks, newTask]);
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              {task.data}
              <button
                className="btn btn--red"
                onClick={() => removeTask(task.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={submitForm}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={handleTaskNameChange}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
