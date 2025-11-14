// src/components/RouteError.tsx
import React from "react";

interface RouteErrorProps {
  status: number | string;
  message: string;
}

const RouteError: React.FC<RouteErrorProps> = ({ status, message }) => {
  return (
    <div>
      <h1>{status}</h1>
      <p>{message}</p>
      <a href="/">Go Home</a>
    </div>
  );
};

export default RouteError;
