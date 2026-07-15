import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { socket } from './src/socket';
import { colors } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import RevealScreen from './src/screens/RevealScreen';
import GameOverScreen from './src/screens/GameOverScreen';

export default function App() {
  const [phase, setPhase] = useState('home'); // home | lobby | question | reveal | gameover
  const [playerId, setPlayerId] = useState(null);
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [finalScores, setFinalScores] = useState([]);
  const [busy, setBusy] = useState(false);
  const [homeError, setHomeError] = useState('');
  const [lobbyError, setLobbyError] = useState('');
  const pendingTimeoutRef = useRef(null);

  const CONNECT_TIMEOUT_MS = 8000;
  const CONNECT_TIMEOUT_MESSAGE =
    'Не удалось подключиться к серверу. Проверьте: сервер запущен, телефон и компьютер в одной Wi-Fi сети, и адрес в config.js совпадает с IP компьютера.';

  const clearPendingTimeout = () => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    function handleRoomUpdate(data) {
      setRoom(data);
    }
    function handleQuestion(data) {
      setQuestion(data);
      setReveal(null);
      setLobbyError('');
      setPhase('question');
    }
    function handleReveal(data) {
      setReveal(data);
      setPhase('reveal');
    }
    function handleGameOver(data) {
      setFinalScores(data.scores);
      setPhase('gameover');
    }
    function handleDisconnect() {
      // keep whatever screen is showing; room_update will reflect connection state
      // when the socket reconnects, or the player can start a new game from Home.
    }
    function handleConnectError() {
      clearPendingTimeout();
      setBusy(false);
      setHomeError(CONNECT_TIMEOUT_MESSAGE);
      socket.disconnect();
    }

    socket.on('room_update', handleRoomUpdate);
    socket.on('question', handleQuestion);
    socket.on('reveal', handleReveal);
    socket.on('game_over', handleGameOver);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('room_update', handleRoomUpdate);
      socket.off('question', handleQuestion);
      socket.off('reveal', handleReveal);
      socket.off('game_over', handleGameOver);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const handleCreate = useCallback((name) => {
    setBusy(true);
    setHomeError('');
    socket.connect();

    pendingTimeoutRef.current = setTimeout(() => {
      setBusy(false);
      setHomeError(CONNECT_TIMEOUT_MESSAGE);
      socket.disconnect();
    }, CONNECT_TIMEOUT_MS);

    socket.emit('create_room', { name }, (res) => {
      clearPendingTimeout();
      setBusy(false);
      if (!res || !res.ok) {
        setHomeError((res && res.error) || 'Не удалось создать комнату');
        socket.disconnect();
        return;
      }
      setPlayerId(res.playerId);
      setPhase('lobby');
    });
  }, []);

  const handleJoin = useCallback((name, code) => {
    setBusy(true);
    setHomeError('');
    socket.connect();

    pendingTimeoutRef.current = setTimeout(() => {
      setBusy(false);
      setHomeError(CONNECT_TIMEOUT_MESSAGE);
      socket.disconnect();
    }, CONNECT_TIMEOUT_MS);

    socket.emit('join_room', { name, code }, (res) => {
      clearPendingTimeout();
      setBusy(false);
      if (!res || !res.ok) {
        setHomeError((res && res.error) || 'Не удалось войти в комнату');
        socket.disconnect();
        return;
      }
      setPlayerId(res.playerId);
      setPhase('lobby');
    });
  }, []);

  const handleStart = useCallback(({ questionCount, topics }) => {
    setLobbyError('');
    socket.emit('start_game', { questionCount, topics }, (res) => {
      if (!res || !res.ok) {
        setLobbyError((res && res.error) || 'Не удалось начать игру');
      }
    });
  }, []);

  const handleAnswer = useCallback((optionIndex) => {
    socket.emit('submit_answer', { optionIndex });
  }, []);

  const handleNext = useCallback(() => {
    socket.emit('next_question', {});
  }, []);

  const handlePlayAgain = useCallback(() => {
    socket.disconnect();
    setPhase('home');
    setPlayerId(null);
    setRoom(null);
    setQuestion(null);
    setReveal(null);
    setFinalScores([]);
    setHomeError('');
    setLobbyError('');
  }, []);

  let content = null;
  if (phase === 'home') {
    content = <HomeScreen onCreate={handleCreate} onJoin={handleJoin} busy={busy} error={homeError} />;
  } else if (phase === 'lobby' && room) {
    content = <LobbyScreen room={room} playerId={playerId} onStart={handleStart} error={lobbyError} />;
  } else if (phase === 'question' && question) {
    content = <QuestionScreen question={question} onAnswer={handleAnswer} />;
  } else if (phase === 'reveal' && reveal && question) {
    content = (
      <RevealScreen reveal={reveal} question={question} isHost={room && room.hostId === playerId} onNext={handleNext} />
    );
  } else if (phase === 'gameover') {
    content = <GameOverScreen scores={finalScores} playerId={playerId} onPlayAgain={handlePlayAgain} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.container}>{content}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
});
