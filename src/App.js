import React,  { Component } from 'react';
import './App.css';
import Header from './components/Header';
import PostList from './components/PostList';

function App() {
  return (
    <div className="App">
      <link rel="stylesheet" href="path/to/font-awesome/css/font-awesome.min.css"></link>
      <Header />
      <PostList />
    </div>
  );
}

export default App;
