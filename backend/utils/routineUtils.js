export const checkOverlap = (tasks) => {
    for (let i = 0; i < tasks.length - 1; i++) {
        const curr = tasks[i];
        const next = tasks[i + 1];

        if (curr.endTime > next.startTime) {
            return true;
        }
    }
    return false;
};
export const calculateBurnoutScore = (
     missedDays,
     completedDays
     ) => {

      const totalDays = missedDays + completedDays;

     if (totalDays === 0) {
     return 0;
    }

     const missedRatio = missedDays / totalDays;

    let burnoutScore = Math.round(missedRatio * 100);

     if (burnoutScore > 100) {
      burnoutScore = 100;
    }

    return burnoutScore;
    };

        export const calculateConsistencyScore = (
         completedDays,
         missedDays
         ) => {

      const totalDays = completedDays + missedDays;

     if (totalDays === 0) {
      return 100;
     }

    const consistencyScore = Math.round(
      (completedDays / totalDays) * 100
     );

     return consistencyScore;
     };

     export const detectFatigueLevel = (burnoutScore) => {

     if (burnoutScore >= 70) {
      return "high";
     }

     if (burnoutScore >= 40) {
     return "medium";
     }

     return "low";
     };

     export const getAdaptiveDifficulty = (
     consistencyScore
     ) => {

     if (consistencyScore >= 80) {
     return "hard";
     }

     if (consistencyScore >= 50) {
     return "moderate";
     }

      return "easy";
   };
