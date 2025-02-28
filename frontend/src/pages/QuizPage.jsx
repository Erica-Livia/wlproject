import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";

function QuizPage({ theme, toggleTheme }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [streak, setStreak] = useState(0);
    const [quizDate, setQuizDate] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);
    const [isQuizAvailable, setIsQuizAvailable] = useState(true); // Track quiz availability

    const user = auth.currentUser;

    // Fetch quiz questions from Firestore
    useEffect(() => {
        const fetchQuestions = async () => {
            const querySnapshot = await getDocs(collection(db, "quizQuestions"));
            const quizData = [];
            querySnapshot.forEach((doc) => {
                quizData.push(doc.data());
            });
            setQuestions(quizData);
        };

        fetchQuestions();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStreak(data.streak || 0);
                    setQuizDate(data.lastQuizDate?.toDate() || null);
                    setQuizHistory(data.quizHistory || []);

                    // Check if the quiz has already been taken today
                    const today = new Date().toDateString();
                    const lastQuizDate = data.lastQuizDate?.toDate().toDateString();
                    if (lastQuizDate === today) {
                        setIsQuizAvailable(false); // Disable quiz if already taken today
                    }
                }
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    // Calculate time remaining for the next quiz
    const calculateTimeRemaining = (lastQuizDate) => {
        const now = new Date();
        const timeDifference = new Date(lastQuizDate).getTime() + 24 * 60 * 60 * 1000 - now.getTime();
        if (timeDifference > 0) {
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours} hours and ${minutes} minutes`;
        } else {
            return null;
        }
    };

    const checkStreak = () => {
        const today = new Date().toDateString();
        if (quizDate && quizDate.toDateString() !== today) {
            if (quizDate.toDateString() === new Date(quizDate).toDateString()) {
                setStreak(streak + 1);
            } else {
                setStreak(1);
            }
        }
    };

    const handleAnswerSelection = (option) => {
        setSelectedAnswer(option);
    };

    const handleSubmit = async () => {
        const isCorrect = selectedAnswer === questions[currentQuestionIndex].answer;
        if (isCorrect) {
            setScore(score + 1);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer("");
        } else {
            setQuizCompleted(true);
            const today = new Date().toDateString();

            if (quizDate?.toDateString() !== today) {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    streak: streak + 1,
                    lastQuizDate: new Date(),
                    quizHistory: [...quizHistory, today],
                });

                setQuizHistory((prev) => [...prev, today]);
            }
        }
    };

    // Prevent rendering the quiz page if it's not available
    if (!isQuizAvailable) {
        return (
            <>
                <NavBar theme={theme} toggleTheme={toggleTheme} />
                <div className=" w-full h-screen mx-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 rounded-lg shadow-xl text-white">
                    {/* Fade-in animation on initial load */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-3xl font-semibold">You have already taken the quiz today!</p>
                    </motion.div>

                    {/* Streak and Fire icon with hover and bounce effects */}
                    <motion.div
                        className="flex items-center justify-center space-x-4 text-xl font-poppins"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <motion.p
                            className="font-semibold text-2xl"
                            whileHover={{ scale: 1.1, color: "#f59e0b" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Days: {streak}
                        </motion.p>

                        <motion.div
                            className="text-yellow-300 text-4xl"
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0], opacity: [1, 0.8, 1] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            }}
                        >
                            <FaFire />
                        </motion.div>
                    </motion.div>
                </div>

            </>
        );
    }

    // if (questions.length === 0) {
    //     return (
    //         <>
    //             <NavBar theme={theme} toggleTheme={toggleTheme} />
    //             <div>Loading quiz...</div>
    //         </>
    //     );
    // }

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            <div className="bg-white">
                {!quizCompleted ? (
                    <div className="w-full h-screen bg-white p-6 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-poppins font-semibold text-gray-800 mb-6 text-center">{questions[currentQuestionIndex]?.question}</h2>
                        <div
                            className={`picture rounded-xl h-1/2 transition-all duration-100 w-2/5 
    ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} 
    flex justify-center items-center mx-auto`}
                            style={{
                                backgroundImage: questions[currentQuestionIndex]?.imageUrl
                                    ? `url(${questions[currentQuestionIndex].imageUrl})`
                                    : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        ></div>
                        <div className="space-y-4 text-black text-center">
                            {questions[currentQuestionIndex]?.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`w-3/5 p-4 border rounded-lg text-lg font-poppins transition duration-300 ease-in-out transform hover:scale-105 ${selectedAnswer === option
                                        ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black"
                                        : "bg-gray-100 hover:bg-yellow-100"
                                        }`}
                                    onClick={() => handleAnswerSelection(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <button
                            className="mt-6 w-full p-3 bg-gradient-to-r from-green-400 to-blue-500 text-black rounded-lg font-poppins text-lg font-semibold transition duration-300 ease-in-out hover:scale-105 disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={!selectedAnswer}
                        >
                            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                        </button>
                    </div>

                ) : (
                    <div className="font-poppins">
                        <h2 className="text-xl mb-4 ">Quiz Completed!</h2>
                        <p>Your score: {score} / {questions.length}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default QuizPage;
