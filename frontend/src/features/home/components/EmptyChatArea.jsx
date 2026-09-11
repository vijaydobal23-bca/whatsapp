const EmptyChatArea = () => {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#222e35] border-b-[6px] border-[#00a884]">
      {/* Lock icon + illustration area */}
      <div className="flex flex-col items-center max-w-[560px] text-center">
        {/* WhatsApp Web illustration */}
        <div className="w-[320px] h-[188px] mb-7 flex items-center justify-center">
          <svg viewBox="0 0 303 172" className="w-full h-full opacity-30">
            <path
              fill="#8696a0"
              d="M229.565 160.229c32.647-12.996 50.563-43.592 50.563-79.337 0-50.43-40.873-81.379-91.276-81.379-27.617 0-52.418 9.197-70.397 27.472C100.478 45.209 89.252 69.626 89.252 97.29c0 7.886.944 15.349 2.738 22.272h-2.585c-5.591 0-10.694 2.147-14.535 5.67-3.903 3.581-6.143 8.418-6.266 13.522L67.5 160.258h162.065z"
            />
            <path
              fill="#364147"
              d="M152.5 2C95.893 2 49.591 37.526 49.591 80.892c0 19.27 8.45 37.08 23.211 51.225l-6.098 28.228L96.898 148.2c17.138 7.974 36.104 12.237 55.602 12.237 56.607 0 102.909-35.526 102.909-78.892S209.107 2 152.5 2z"
            />
            <path
              fill="#8696a0"
              d="M152.5 12.2c-50.861 0-92.217 30.869-92.217 68.892 0 17.791 8.073 34.244 22.004 47.027l1.48 1.36-5.284 24.455 26.164-10.477 1.7.754c15.486 6.863 33.063 10.483 50.853 10.483 50.861 0 92.217-30.869 92.217-68.892S203.361 12.2 152.5 12.2z"
            />
          </svg>
        </div>

        <h2 className="text-[#e9edef] text-[32px] font-light mb-3 tracking-tight">
          WhatsApp Web
        </h2>

        <p className="text-[#8696a0] text-[14px] leading-[20px] mb-8">
          Send and receive messages without keeping your phone online.
          <br />
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        {/* End-to-end encrypted notice */}
        <div className="flex items-center gap-2 text-[#8696a0] text-[12px]">
          <svg viewBox="0 0 10 12" className="w-[10px] h-[12px] fill-[#8696a0]">
            <path d="M5.002 0c-1.674 0-3.031 1.41-3.031 3.152v1.907H.957a.942.942 0 0 0-.938.953v4.988c0 .528.42.953.938.953h8.087a.942.942 0 0 0 .937-.953V6.012a.942.942 0 0 0-.937-.953H7.03V3.152C7.03 1.41 5.676 0 5.002 0zm0 1.074c1.148 0 2.012.93 2.012 2.078v1.907H2.987V3.152c0-1.148.87-2.078 2.015-2.078z" />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatArea;
