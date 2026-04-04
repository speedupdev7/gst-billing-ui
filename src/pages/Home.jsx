import React, { useMemo, useState } from "react";
import heroImage from "../assets/homePageImage.png";
import Leaves from "../assets/Leaves.png";

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return "Good Morning";
  if (hr < 17) return "Good Afternoon";
  return "Good Evening";
};

const Home = () => {
  const greeting = useMemo(() => getGreeting(), []);
  const userName = "Mubin";

  const tabs = [{ key: "home", label: "Home", image: heroImage }];

  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="relative overflow-hidden">
      
      {/* LEAVES IMAGE: Now positioned on the LEFT side */}
      {/* <img
        src={Leaves}
        alt="Leaves Decoration"
        className="absolute top-0 left-0 w-[250px] md:w-[450px] opacity-10 pointer-events-none z-0 -scale-x-100"
      /> */}

      {/* MAIN LAYOUT - Unchanged UI */}
      <main className="relative z-10 flex w-full h-[600px] md:h-screen lg:h-[450px] flex-col lg:flex-row">
        {/* LEFT IMAGE (changes by tab) */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2">
          <img
            src={tabs.find((t) => t.key === activeTab).image}
            alt="Tab Illustration"
            className="max-h-[260px] sm:max-h-[300px] md:max-h-[700px] lg:max-h-[450px] object-contain w-auto"
          />
        </div>

        {/* RIGHT GREETING */}
        <div className="w-full lg:w-1/2 flex justify-center items-center px-6 text-center lg:text-left order-2 lg:order-1">
          <div>
            <h1 className="font-poppins font-normal sm:text-3xl md:text-4xl lg:text-6xl font-black">
              Welcome,
            </h1>
            <h1 className="text-2xl font-poppins font-medium sm:text-3xl md:text-4xl lg:text-6xl font-black">
              {greeting}
            </h1>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
