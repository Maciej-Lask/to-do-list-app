const express = require('express');
const path = require('path');
const socket = require('socket.io');
const app = express();
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

const io = socket(server);
const tasks = [];

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);

  socket.emit('updateData', tasks);

  socket.on('addTask', (taskData) => {
    tasks.push(taskData);

    socket.broadcast.emit('addTask', taskData);
  });

  socket.on('removeTask', (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const removedTask = tasks.splice(taskIndex, 1)[0];

      socket.broadcast.emit('removeTask', removedTask.id);
    //   console.log(tasks);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

