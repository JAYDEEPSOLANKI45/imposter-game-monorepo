import { useEffect, useState } from "react";

const useCountdown = (
  duration: number,
  onComplete: () => void,
  deps: any[]
) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(()=>{
    setTimeLeft(duration);

    if(duration<=0) return;

    const interval = setInterval(()=>{
        setTimeLeft((t)=>{
            if(t<=1) {
                clearInterval(interval);
                onComplete();
                return 0;
            }
            return t-1;
        })
    },1000)

    return ()=>clearInterval(interval);
  },[duration,...deps])

  return timeLeft;
};

export default useCountdown;
