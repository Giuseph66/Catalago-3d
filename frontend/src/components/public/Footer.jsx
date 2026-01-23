import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>Catálogo 3D</h3>
            <p className="text-gray-400">
              Impressão 3D de qualidade em Sinop - Mato Grosso
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/catalogo" className="text-gray-400 hover:text-white">
                  Catálogo
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Localização</h4>
            <p className="text-gray-400">
              Sinop – Mato Grosso
            </p>
            <p className="text-gray-400 mt-2">
              Entregas locais sem frete
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Catálogo 3D. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

