import React, { useEffect, useRef, useState } from 'react'
import Particles from "../react-ui/Particles"
import finSound from "../assets/sounds/fin.mp3"



const Pomodoro = () => {
   const [showSettings, setShowSettings] = useState(false);
const [showPopUp, setShowPopUp] = useState(false);

const [focusTime, setFocusTime] = useState(25);
const [shortBreak, setShortBreak] = useState(5);
const [longBreak, setLongBreak] = useState(15);

const [timeLeft, setTimeLeft] = useState(25 * 60);
const [isRunning, setIsRunning] = useState(false);
const [mode, setMode] = useState("focus");
const getCurrentTime = () => {
    if (mode === "focus") return focusTime;
    if (mode === "short") return shortBreak;
    return longBreak;
};
const finRef = useRef(new Audio(finSound));

    const stopCompletionSound = () => {
        if (finRef.current) {
            finRef.current.pause();
            finRef.current.currentTime = 0;
            finRef.current.loop = false;
        }
    };

    // Stop audio when the user navigates away from the page
    useEffect(() => {
        return () => stopCompletionSound();
    }, []);

    useEffect(() => {
    if (!isRunning) {
        setTimeLeft(getCurrentTime() * 60);
    }
}, [focusTime, shortBreak, longBreak, mode, isRunning]);
    useEffect(()=>{
        let interval;

        if(isRunning){
            interval= setInterval(()=>{
                setTimeLeft((prev)=>{
                   if(prev<=1){
    clearInterval(interval);
    setIsRunning(false);
    finRef.current.play();
    setShowPopUp(true);
    return 0;
}
                    return prev-1;
                })
            },1000);
        }

        return ()=> clearInterval(interval)
    },[isRunning]);

    const formatTime= ()=>{
        const minutes = Math.floor(timeLeft/60);
        const seconds = Math.floor(timeLeft%60);

        return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    }


    return (
        <div className='w-full h-full'>
            <div style={{ width: '100%', height: '600px', position: 'relative', zIndex: '0' }}>
                <Particles
                    particleColors={["#4eb7b3"]}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover
                    alphaParticles={false}
                    disableRotation={false}
                    pixelRatio={1}
                />
            </div>

            <div className='absolute inset-0 flex flex-col items-center justify-center z-10 gap-5'>
                <h1 className='font-bold text-3xl mb-3 p-3 flex justify-center text-center text-[#4eb7b3]'>Focus. Build habits. Forge your day.</h1>
                <button
    onClick={() => setShowSettings(!showSettings)}
    className='px-4 py-2 rounded-xl bg-[#4eb7b3]/20 border border-[#4eb7b3]/40 text-[#4eb7b3]'
>
    ⚙ Timer Settings
</button>
<div className="flex gap-3">
    <button
        onClick={()=>setMode("focus")}
       className={`btn cursor-pointer ${
 mode==="focus"
 ? "bg-[#4eb7b3] text-black"
 : "btn-primary"
}`}
    >
        Focus
    </button>

    <button
        onClick={()=>setMode("short")}
        className={`btn cursor-pointer ${
 mode==="short"
 ? "bg-[#4eb7b3] text-black"
 : "btn-primary"
}`}
    >
        Short Break
    </button>

    <button
        onClick={()=>setMode("long")}
       className={`btn cursor-pointer ${
 mode==="long"
 ? "bg-[#4eb7b3] text-black"
 : "btn-primary"
}`}
    >
        Long Break
    </button>
</div>
                {showSettings && (
                     
   <div className='flex flex-col sm:flex-row gap-4 p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-[#4eb7b3]/20'>

        <div className='flex flex-col'>
          
            <label className='text-[#4eb7b3] text-sm'>
                Focus
            </label>
            <input
                type='number'
                min='1'
                max='180'
                value={focusTime}
onChange={(e)=>{
 const value = Number(e.target.value);

 if(value >= 1 && value <= 180){
    setFocusTime(value);
 }
}}                className='w-20 px-2 py-1 rounded-lg bg-white/10 text-white'
            />
        </div>

        <div className='flex flex-col'>
            <label className='text-[#4eb7b3] text-sm'>
                Short Break
            </label>

            <input
                type='number'
                min='1'
                max='60'
                value={shortBreak}
onChange={(e)=>{
 const value = Number(e.target.value);

 if(value >= 1 && value <= 60){
    setShortBreak(value);
 }
}}          
      className='w-20 px-2 py-1 rounded-lg bg-white/10 text-white'
            />
        </div>

        <div className='flex flex-col'>
            <label className='text-[#4eb7b3] text-sm'>
                Long Break
            </label>

            <input
                type='number'
                min='1'
                max='120'
                value={longBreak}
onChange={(e)=>{
 const value = Number(e.target.value);

 if(value >= 1 && value <= 120){
    setLongBreak(value);
 }
}}                className='w-20 px-2 py-1 rounded-lg bg-white/10 text-white'
            />
        </div>

    </div>
)}
                <div className='w-[280px] h-[280px] rounded-full bg-[#0f172a]/80 backdrop-blur-xl shadow-[0_0_30px_#4eb7b3] border border-white/20 flex items-center justify-center'>
                    <h1 className='text-7xl font-bold text-[#4eb7b3]'>{formatTime()}</h1>
                </div>

                <div className='mt-5 z-20'>
                    <div className='flex flex-row gap-4'>
                       <button className='cursor-pointer btn btn-primary'
onClick={()=>{
 if(!isRunning){
    if(timeLeft === 0){
        setTimeLeft(getCurrentTime()*60);
    }
    setIsRunning(true);
}
}}
>
                            Start
                        </button>

                        <button className='cursor-pointer btn btn-primary'
                            onClick={()=> setIsRunning(false)}
                        >
                            Pause
                        </button>

                        <button className='cursor-pointer btn btn-primary'
onClick={()=>{
setTimeLeft(getCurrentTime() * 60);
setIsRunning(false);
stopCompletionSound();
setShowPopUp(false);
}}                        >
                            Reset
                        </button>

                    </div>
                </div>

                {showPopUp && <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
                        <div className='border border-[#4eb7b3] bg-[#0f172a] rounded-xl p-6 shadow-3xl flex flex-col items-center gap-4'>
                            <h1 className='text-3xl font-bold text-[#4eb7b3] text-center'>Session Complete!</h1>
                            <p className='text-center text-md text-[#4eb7b3]'>{mode==="focus" ? "Great work. Take a break!" : "Break completed. Ready to focus?"}</p>

                            <button className='btn btn-primary cursor-pointer' onClick={()=> {finRef.current.pause(); finRef.current.currentTime=0; setShowPopUp(false)}}>
                                Close
                            </button>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export default Pomodoro
