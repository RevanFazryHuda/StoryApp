import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import AddPage from '../pages/add/add-page';
import DetailPage from '../pages/detail/detail-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import NotFound from '../pages/not-found';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/add': new AddPage(),
  '/detail/:id': new DetailPage(),
  '/auth/login': new LoginPage(),
  '/auth/register': new RegisterPage(),
  '/404': new NotFound(),
};

export default routes;