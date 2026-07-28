import React, { useEffect, useRef, useState } from 'react'
import Particles from "../react-ui/Particles"
import finSound from "../assets/sounds/fin.mp3"

const Pomodoro = () => {

    const [showPopUp, setShowPopUp]= useState(false);
    const [timeLeft, setTimeLeft] = useState(25*60);
    const [isRunning, setIsRunning]= useState(false);

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

    useEffect(()=>{
        let interval;

        if(isRunning){
            interval= setInterval(()=>{
                setTimeLeft((prev)=>{
                    if(prev<=1){
                        clearInterval(interval);
                        setTimeLeft(25*60);
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
    },[isRunning, timeLeft]);

    const formatTime= ()=>{
        const minutes = Math.floor(timeLeft/60);
        const seconds = timeLeft%60;

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
                <h1 className='font-bold text-3xl mb-3 p-3 flex justify-center text-center text-[#4eb7b3]'>Complete your tasks with a pomodoro timer.</h1>
                <div className='w-[280px] h-[280px] rounded-full bg-white backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center'>
                    <h1 className='text-7xl font-bold text-[#4eb7b3]'>{formatTime()}</h1>
                </div>

                <div className='mt-5 z-20'>
                    <div className='flex flex-row gap-4'>
                        <button className='cursor-pointer btn btn-primary'
                            onClick={()=> setIsRunning(true)}
                        >
                            Start
                        </button>

                        <button className='cursor-pointer btn btn-primary'
                            onClick={()=> setIsRunning(false)}
                        >
                            Pause
                        </button>

                        <button className='cursor-pointer btn btn-primary'
                            onClick={()=>{setTimeLeft(25*60); setIsRunning(false); stopCompletionSound(); setShowPopUp(false);}}
                        >
                            Reset
                        </button>

                    </div>
                </div>

                {showPopUp && <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
                        <div className='border border-[#4eb7b3] bg-[#0f172a] rounded-xl p-6 shadow-3xl flex flex-col items-center gap-4'>
                            <h1 className='text-3xl font-bold text-[#4eb7b3] text-center'>Session Complete!</h1>
                            <p className='text-center text-md text-[#4eb7b3]'>Great work. Take a break!</p>

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
