import { useEffect, useState } from "react";

const App = () => {
    const [word, setWord] = useState("");
    const [data, setData] = useState([]);
    const [isShowHits, setIsShowHits] = useState(false);
    const [isGameOver, setGameState] = useState(false);

    const keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
    ];

    const clearBoard = () => {
        document.querySelectorAll(".letter").forEach(letter => {
            letter.innerText = "";
            letter.classList.remove("correct", "wrong-pos", "incorrect", "selected");
        });
    
        let rows = document.querySelectorAll(".grid-rows-6 > div");
        rows.forEach(row => row.classList.remove("active"));
        
        rows[0].classList.add("active");
        rows[0].querySelector(".letter").classList.add("selected");
    };
    

    const fetchData = async () => {
        try {
            const response = await fetch("/wordle_words.txt");
            const text = await response.text();
            const words = text.split("\n").map(word => word.trim().toUpperCase());
            setData(words);
            setWord(words[Math.floor(Math.random() * words.length)])


        } catch (error) {
            console.error("Error fetching word:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    function typeLetter(letter) {
        let words = document.querySelector(".active");
        let letterElement = words.querySelector(".selected");
        if (words.nextElementSibling) {
            if (letter === "DELETE") {
                letterElement.innerText = "";
                if (letterElement.previousElementSibling) {
                    letterElement.classList.remove("selected");
                    letterElement.previousElementSibling.classList.add("selected")
                }
            } else if (letter === "ENTER") {
                let letters = [...document.querySelector(".active").querySelectorAll(".letter")];
                let currentWord = letters.map(letter => letter.innerText).join("");

                if (currentWord.length === 5) {
                    console.log("Current word:", currentWord);
                    console.log("Target word:", word, typeof word);

                    if (data.includes(currentWord)) { // Ensure data is an array of words
                        letters.forEach((letterElement, index) => {
                            let letterChar = letterElement.innerText;

                            if (word && typeof word === "string") { // Ensure 'word' is a string
                                if (letterChar === word[index]) {
                                    letterElement.classList.add("correct");
                                } else if (word.includes(letterChar)) {
                                    letterElement.classList.add("wrong-pos");
                                } else {
                                    letterElement.classList.add("incorrect");
                                }

                            } else {
                                console.error("Error: 'word' is not a string", word);
                            }
                        });

                        let activeRow = document.querySelector(".active");
                        activeRow.querySelector(".selected").classList.remove("selected")
                       
                        // TODO : Check if all column is all correct
                        let correctColumns = [...activeRow.querySelectorAll(".correct")]
                        if(correctColumns.length === 5) {
                            setGameState(true);
                        }
                        else {
                            // Move to the next row after checking
                            if (activeRow.nextElementSibling) {
                                
                                activeRow.classList.remove("active");
                                activeRow.nextElementSibling.classList.add("active");
    
                                // Set the first letter in the new row as selected
                                let nextRowLetters = activeRow.nextElementSibling.querySelectorAll(".letter");
                                nextRowLetters[0].classList.add("selected");
                            }
                        }
                        
                    } else {
                        console.error("Invalid word:", currentWord);
                    }
                }
            }

            else {
                letterElement.innerText = letter;
                if (letterElement.nextElementSibling) {
                    letterElement.classList.remove("selected");
                    letterElement.nextElementSibling.classList.add("selected")
                }
            }
        }

    }

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2 bg-gray-900 text-white">
            {/* {word} */}
            <button
                onClick={() => setIsShowHits(!isShowHits)}
                className="fixed bottom-4 right-4 cursor-pointer text-2xl hover:text-gray-400">
                <i className="fa-solid fa-puzzle-piece"></i>
            </button>
            {
                isShowHits &&
                (<div className="flex gap-2 justify-center items-center bg-gray-700 rounded-md p-6 fixed">
                    <p className="text-[1.2rem] font-bold ">hits: </p>
                    {
                        (word).split("").map((letter, index) => (
                            <span key={index} className="text-[1.2rem] font-bold">
                                {(index === 0 || index === word.length - 1) ? letter : "_"}
                            </span>
                        ))
                    }
                </div>)
            }
            {
                isGameOver && (
                    <div
                        className="fixed w-100 h-100 bg-gray-700 rounded-md ring-3 ring-gray-600 flex flex-col items-center"
                    >
                        <h1 className="text-3xl font-bold text-center my-15">YOU WIN!</h1>
                        <h2 className="text-center">Current Word is : {word}</h2>
                        <button 
                            onClick={() => {
                                setGameState(false)
                                fetchData()
                                clearBoard()
                            }}
                            className="absolute bottom-10 py-2 px-4 ring-green-400 ring-2 bg-green-500 rounded-full"
                            >
                                Next Word
                        </button>
                    </div>)

            }

            <h1 className="text-3xl font-bold my-5">Wordle</h1>
            <div className="h-100 grid grid-rows-6">
                {Array.from({ length: 6 }).map((_, y) => (
                    <div key={y} className={`grid grid-cols-5 w-80 ${y === 0 && "active"}`}>
                        {Array.from({ length: 5 }).map((_, x) => (
                            <span key={x} className={`text-4xl font-bold w-13 h-13 ring-2 ring-gray-600 rounded-sm flex justify-center content-center transition-all duration-300 ease-in-out ${(x === 0 && y === 0) && "selected"} letter`}>

                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* Keyboard Layout */}
            <div className="flex flex-col gap-2">
                {keyboard.map((row, y) => (
                    <div key={y} className={`flex gap-2 justify-center ${y === 1 ? "ml-4" : ""}`}>
                        {row.map((key, x) => (
                            <button
                                key={x}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 cursor-pointer hover:ring-2 ring-white rounded-md text-white text-lg font-semibold"
                                onClick={() => typeLetter(key)}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
