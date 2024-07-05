import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import { useState } from 'react';
import Home from './Pages/Home.jsx'
import Forms from './Pages/FormsAssistance.jsx'
import Topbar from './Pages/Topbar.jsx';
import Create_Account from './Pages/user/Create_Account.jsx';
import Login from './Pages/user/Login.jsx';
import Forums from './Pages/forum/Forums.jsx';
import Cookies from 'js-cookie';
import ForumPage from './Pages/forum/ForumPage.jsx';
import Essay from './Pages/Essay.jsx'
import User from './Pages/user/User.jsx'
import Chat_Home from './Pages/chat/Chat_Home.jsx';
import Friends from './Pages/chat/Friends.jsx'
import Chat from './Pages/chat/Chat.jsx';
import Testing from './Pages/chat/SetUpChat.jsx'

function getCookie() {
  if (Cookies.get('mysession') === undefined) {
    return false
  }
  
  else {
    return true;
  }
}

function App() {

  //signedIn is a boolean that is set to false when a user is not signed in and true when a user is signed in.
  //setSignedIn lets components set the signedIn boolean when a user successfully signs in.
  let [signedIn, setSignedIn] = useState(getCookie());
  let [username, setUserName] = useState("");

  return (
    <BrowserRouter>
      <Topbar username={username} isSignedIn={signedIn} changeIsSignedIn={setSignedIn}/>
      <Routes>
        <Route path='/about_us' element = {<Home/>}/>
        <Route path='/formsassistance' element = {<Forms/>}/>
        <Route path='/user/create_account' element = {<Create_Account/>}/>
        <Route path='/user/login' element = {<Login changeUsername={setUserName} changeIsSignedIn={setSignedIn}/>}/>
        <Route path='/' element = {<Forums/>}/>
        <Route path='/forum/:id' element = {<ForumPage/>}/>
        <Route path='/essay' element = {<Essay/>}/>
        <Route path='/user/:id' element = {<User/>}/>
        <Route path='/chat' element ={<Chat_Home/>}/>
        <Route path='/chat/friends' element={<Friends/>}/>
        <Route path='/setUpChat/:id' element = {<Testing/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
