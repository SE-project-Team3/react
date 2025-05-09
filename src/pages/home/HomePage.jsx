import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Home.css';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const now = new Date();
  const navigate = useNavigate();

  const isDateDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    return date < today || date > oneMonthLater;
  };

  const isLunchDisabled = () => {
    const isToday = selectedDate.toDateString() === now.toDateString();
    return isToday && now.getHours() >= 11;
  };

  const isDinnerDisabled = () => {
    const isToday = selectedDate.toDateString() === now.toDateString();
    return isToday && now.getHours() >= 17;
  };

  return (
    <div className="home-page">
      <div className="left-section">
        <div>
          <h2>예약 날짜</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileDisabled={isDateDisabled}
            formatDay={(locale, date) => date.getDate()}
          />
        </div>
      </div>

      <div className="right-section">
        <h2>예약 시간</h2>
        <div className="time-select">
          <button
            className={selectedTime === '점심' ? 'active' : ''}
            onClick={() => setSelectedTime('점심')}
            disabled={isLunchDisabled()}
          >
            점심
          </button>
          <button
            className={selectedTime === '저녁' ? 'active' : ''}
            onClick={() => setSelectedTime('저녁')}
            disabled={isDinnerDisabled()}
          >
            저녁
          </button>
        </div>

        <h2>예약 인원</h2>
        <div className="people-select">
          <button onClick={() => setPeopleCount((prev) => Math.max(1, prev - 1))}>-</button>
          <span>{peopleCount}</span>
          <button onClick={() => setPeopleCount((prev) => prev + 1)}>+</button>
        </div>

        <button
        className="check-availability"
        onClick={() => navigate('/view-table', {
          state: {
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            people: peopleCount,
          },
        })
        }>
        예약 가능 테이블 보기
        </button>
      </div>
    </div>
  );
};

export default HomePage;