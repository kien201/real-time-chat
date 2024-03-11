import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import store from './store'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import User from './pages/User'

const router = createBrowserRouter([
    {
        path: '/*',
        element: <PrivateRoute />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'user',
                element: <User />,
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
])

function App() {
    return (
        <>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
            <ToastContainer />
        </>
    )
}

export default App
