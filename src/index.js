import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const initialData = [
  {text: "This is not completed 1", completed: false, id: 0},
  {text: "This is not completed 2", completed: false, id: 1},
  {text: "This is completed 1", completed: true, id:2},
  {text: "This is completed 2", completed: true, id:3},
]

ReactDOM.render(
  <React.StrictMode>
    <App initialData={initialData} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
