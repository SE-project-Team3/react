import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/');
    }
  }, [navigate]);
}

export default useAuthGuard;