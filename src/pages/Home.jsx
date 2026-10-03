import React, { useMemo, useState } from "react";
import heroImage from "../assets/homePageImage.png";

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
    <div className="relative overflow-hidden bg-[#f4f6f9]">

      <main className="relative z-10 flex w-full h-[600px] md:h-screen lg:h-[450px] flex-col lg:flex-row font-poppins">

        {/* IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2">

          <div
            className="
              relative
              w-[95%]
              h-[90%]
              flex
              items-center
              justify-center
              overflow-hidden
            "
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 52%, rgba(0,0,0,0.9) 62%, transparent 88%)",
              maskImage:
                "radial-gradient(ellipse at center, black 52%, rgba(0,0,0,0.9) 62%, transparent 88%)",
            }}
          >
            <img
              src={tabs.find((t) => t.key === activeTab).image}
              alt="GST Illustration"
              className="
                w-full
                h-full
                object-contain
                scale-[1.08]
              "
            />
          </div>

        </div>

        {/* GREETING */}
        <div className="w-full lg:w-1/2 flex justify-center items-center px-6 text-center lg:text-left order-2 lg:order-1">

          <div>
            <h1 className="font-poppins font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#17233d]">
              Welcome,
            </h1>

            <h1 className="text-3xl font-poppins font-medium sm:text-4xl md:text-5xl lg:text-6xl text-[#17233d]">
              {greeting}
            </h1>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Home;