import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { db, auth } from "../firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { FaFire, FaTrophy, FaCalendarCheck, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import quizQuestions from "../data/quizQuestions.json";

function QuizPage({ theme, toggleTheme }) {
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isQuizAvailable, setIsQuizAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [dailySeed, setDailySeed] = useState(null);

  const navigate = useNavigate();
  const user = auth.currentUser;

  // Get today's date in a consistent format
  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  // Generate a seed value based on the date
  const generateDailySeed = (dateString) => {
    let total = 0;
    for (let i = 0; i < dateString.length; i++) {
      total += dateString.charCodeAt(i);
    }
    return total;
  };

  // Use Fisher-Yates shuffle algorithm with seed
  const seedShuffle = (array, seed) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    
    // Seed the random function
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // While there remain elements to shuffle
    while (currentIndex !== 0) {
      // Pick a remaining element
      const randomIndex = Math.floor(random() * currentIndex);
      currentIndex--;

      // Swap with the current element
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  };

  // Select 3 questions deterministically based on today's date
  const selectDailyQuestions = (questions, seed) => {
    if (questions.length < 3) return questions;
    
    const shuffledQuestions = seedShuffle(questions, seed);
    return shuffledQuestions.slice(0, 3);
  };

  // Get current question
  const currentQuestion = useMemo(() => {
    return dailyQuestions.length > 0 && currentQuestionIndex < dailyQuestions.length 
      ? dailyQuestions[currentQuestionIndex] 
      : null;
  }, [dailyQuestions, currentQuestionIndex]);

  // Calculate time remaining until next quiz
  const timeRemaining = useMemo(() => {
    if (!lastQuizDate) return null;
    
    const now = new Date();
    const nextQuizTime = new Date(lastQuizDate);
    nextQuizTime.setDate(nextQuizTime.getDate() + 1);
    nextQuizTime.setHours(0, 0, 0, 0);
    
    const timeDiff = nextQuizTime - now;
    
    if (timeDiff <= 0) return null;
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [lastQuizDate]);

  // Handle answer selection
  const handleAnswerSelection = (option) => {
    setSelectedAnswer(option);
  };

  // Check answer and show feedback
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Add to answered questions array
    setAnsweredQuestions([
      ...answeredQuestions,
      {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        correct
      }
    ]);
    
    // Update score if correct
    if (correct) {
      setScore(score + 1);
    }
    
    // Show feedback for 1.5 seconds before moving to next question
    setTimeout(() => {
      setShowFeedback(false);
      
      // Move to next question or complete quiz
      if (currentQuestionIndex < dailyQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      } else {
        completeQuiz();
      }
    }, 1500);
  };

  // Complete the quiz and update user data
  const completeQuiz = async () => {
    setQuizCompleted(true);
    
    if (user) {
      try {
        const today = getTodayString();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let newStreak = 1;
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const lastDate = userData.lastQuizDate?.toDate();
          
          // Calculate streak - increase if yesterday, reset if gap
          if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            const lastDateMidnight = new Date(lastDate);
            lastDateMidnight.setHours(0, 0, 0, 0);
            
            if (lastDateMidnight.getTime() === yesterday.getTime()) {
              newStreak = (userData.streak || 0) + 1;
            } else if (lastDateMidnight.getTime() >= new Date().setHours(0, 0, 0, 0)) {
              // Quiz already taken today - keep current streak
              newStreak = userData.streak || 1;
            }
            // Otherwise reset to 1 (implicit)
          }
          
          // Save quiz results
          await updateDoc(userRef, {
            streak: newStreak,
            lastQuizDate: new Date(),
            quizHistory: [...(userData.quizHistory || []), today],
            [`dailyQuizResults.${today}`]: {
              date: today,
              score,
              questions: dailyQuestions,
              answeredQuestions,
              timestamp: new Date()
            }
          });
          
          // Update local streak
          setStreak(newStreak);
          
          // Trigger confetti if perfect score
          if (score === dailyQuestions.length) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }
  };

  // Handle retaking quiz tomorrow
  const handleTomorrow = () => {
    navigate("/");
  };

  // Initialize quiz with user data and daily questions
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        const today = getTodayString();
        const seed = generateDailySeed(today);
        setDailySeed(seed);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setStreak(userData.streak || 0);
          setLastQuizDate(userData.lastQuizDate?.toDate() || null);
          setQuizHistory(userData.quizHistory || []);

          // Check if the quiz was already taken today
          const lastQuizDateStr = userData.lastQuizDate?.toDate().toDateString();
          const todayStr = new Date().toDateString();
          
          if (lastQuizDateStr === todayStr) {
            setIsQuizAvailable(false);
            
            // If user already took the quiz today, show their results
            if (userData.dailyQuizResults && userData.dailyQuizResults[today]) {
              const todayResults = userData.dailyQuizResults[today];
              setScore(todayResults.score || 0);
              setDailyQuestions(todayResults.questions || []);
              setAnsweredQuestions(todayResults.answeredQuestions || []);
              setQuizCompleted(true);
            }
          } else {
            // Select new questions for today
            const selected = selectDailyQuestions(quizQuestions, seed);
            setDailyQuestions(selected);
          }
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            streak: 0,
            quizHistory: [],
            dailyQuizResults: {}
          });
          
          // Select new questions for today
          const selected = selectDailyQuestions(quizQuestions, seed);
          setDailyQuestions(selected);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing quiz:", error);
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <>
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <div className="h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading your daily quiz...</p>
          </div>
        </div>
      </>
    );
  }

  // Quiz already taken today
  if (!isQuizAvailable && !quizCompleted) {
    return (
      <>
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-6">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                <p className="text-lg">You've already completed today's quiz</p>
              </motion.div>
            </div>
            
            <div className="p-6">
              <motion.div
                className="flex items-center justify-center space-x-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="flex items-center justify-center bg-orange-100 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaFire className="text-orange-500 text-2xl" />
                </motion.div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{streak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </motion.div>
              
              {timeRemaining && (
                <motion.div 
                  className="bg-blue-50 p-4 rounded-xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="text-center text-blue-800">
                    Next quiz available in: <span className="font-bold">{timeRemaining}</span>
                  </p>
                </motion.div>
              )}
              
              <motion.button
                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-black rounded-lg font-medium text-lg transition duration-300 hover:shadow-lg"
                onClick={handleTomorrow}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Return Home
              </motion.button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Quiz results screen
  if (quizCompleted) {
    return (
      <>
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                <p className="text-xl">
                  You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{dailyQuestions.length}</span>
                </p>
              </motion.div>
            </div>
            
            <div className="p-6">
              <motion.div
                className="flex items-center justify-center space-x-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="flex items-center justify-center bg-indigo-100 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaTrophy className="text-indigo-500 text-2xl" />
                </motion.div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{streak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-700 text-center mb-3">Question Summary</h2>
                {dailyQuestions.map((question, index) => {
                  const userAnswer = answeredQuestions.find(a => a.questionId === question.id);
                  const isCorrect = userAnswer && userAnswer.correct;
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{index + 1}. {question.question}</p>
                          <p className="mt-1 text-sm">
                            <span className="font-medium text-gray-600">Your answer:</span>{" "}
                            <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                              {userAnswer ? userAnswer.userAnswer : "No answer"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="mt-1 text-sm">
                              <span className="font-medium text-gray-600">Correct answer:</span>{" "}
                              <span className="text-green-600">{question.answer}</span>
                            </p>
                          )}
                        </div>
                        <div className="ml-3">
                          {isCorrect ? (
                            <FaCheck className="text-green-500 text-xl" />
                          ) : (
                            <FaTimes className="text-red-500 text-xl" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
              
              {timeRemaining && (
                <motion.div 
                  className="bg-blue-50 p-4 rounded-xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <p className="text-center text-blue-800">
                    Next quiz available in: <span className="font-bold">{timeRemaining}</span>
                  </p>
                </motion.div>
              )}
              
              <motion.button
                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-black rounded-lg font-medium text-lg transition duration-300 hover:shadow-lg"
                onClick={handleTomorrow}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                Return Home
              </motion.button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Active quiz screen
  return (
    <>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Quiz progress header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Daily Quiz</h1>
              <div className="flex items-center space-x-2">
                <FaCalendarCheck className="text-yellow-300" />
                <span className="font-medium">
                  Question {currentQuestionIndex + 1}/{dailyQuestions.length}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 bg-blue-200 rounded-full h-2.5">
              <div 
                className="bg-yellow-300 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex) / dailyQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Main quiz content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {currentQuestion && !showFeedback && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h2>
                  
                  {/* Add image if available */}
                  {currentQuestion.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question visual" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <motion.div
                        key={option}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAnswer === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => handleAnswerSelection(option)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-gray-700">{option}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <button
                    className={`w-full mt-8 py-3 rounded-lg font-medium text-lg transition duration-300 ${
                      selectedAnswer
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!selectedAnswer}
                    onClick={handleCheckAnswer}
                  >
                    Check Answer
                  </button>
                </motion.div>
              )}
              
              {/* Feedback after answering */}
              {showFeedback && currentQuestion && (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCorrect ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <FaCheck className="text-green-500 text-4xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-600">Correct!</h2>
                      <p className="text-gray-600">{currentQuestion.explanation}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <FaTimes className="text-red-500 text-4xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-red-600">Incorrect</h2>
                      <p className="text-gray-700">
                        The correct answer is: <span className="font-semibold">{currentQuestion.answer}</span>
                      </p>
                      <p className="text-gray-600">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuizPage;