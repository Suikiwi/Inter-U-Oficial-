import { Routes, Route } from 'react-router-dom';
import PruebaConexionAPI from './pruebaconexionapi';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PruebaConexionAPI />} />
    </Routes>

  );
};

export default App;
