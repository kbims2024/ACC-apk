import { useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export default function MakeAdmin() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/users/upgrade-to-admin', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      toast.error("Votre compte est maintenant Administrateur ! Veuillez vous reconnecter.");
      logout();
      navigate('/login');
    })
    .catch(err => {
      console.error(err);
      toast.error("Erreur");
    });
  }, [token, navigate, logout]);

  return <div className="p-8 text-center mt-20 text-xl font-bold">Mise à jour de votre compte en cours...</div>;
}
