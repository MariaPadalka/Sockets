import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Input, Button, message, Row, Col, Switch as AntSwitch } from 'antd'; // Import Switch as AntSwitch
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import "./client.style.css";

const Client = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [greeting, setGreeting] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sequentialMode, setSequentialMode] = useState(true);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('login_success', ({ name }) => {
      setGreeting(`Welcome, ${name}!`);
    });

    newSocket.on('login_fail', ({ message }) => {
      setGreeting(`Login failed: ${message}`);
    });

    newSocket.on('message', ({ message }) => {
      setMessages(messages => [...messages, message]);
      setMessage("");
    });

    newSocket.on('login_required', ({ message }) => {
      setGreeting(message);
    });

    return () => newSocket.disconnect();
  }, []);

  const loginHandler = () => {
    if (socket) {
      socket.emit('login', { username: login, password });
    }
  };

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', { text: message, sequentialMode: sequentialMode});
    }
  };

  const toggleProcessingMode = (checked) => {
    if (socket) {
      setSequentialMode(checked);
    }
  };

  const displayMessages = () => {
    return messages?.map((msg, index) => <p key={index}>{msg}</p>);
  };

  return (
    <div className='wrap'>
      <div className='menu-container'>
        <h1>Клієнтська програма</h1>
        <Input
          autoFocus
          className='input'
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <Input.Password
          className='input'
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
        <Button onClick={loginHandler} className='login-button'>Log in</Button>
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <Input
              className='input'
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={sendMessage} className='send-button'>Send</Button>
          </Col>
          <Col>
            <AntSwitch
            checked={sequentialMode}
            onChange={toggleProcessingMode}
            className='mode-switch'
            checkedChildren="Sequential"
            unCheckedChildren="Parallel"
            />
          </Col>
        </Row>
        
        <p>{greeting}</p>
        {displayMessages()}
      </div>
    </div>
  );
}

export default Client;
