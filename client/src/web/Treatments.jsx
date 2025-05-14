import axios from "axios";
import { useEffect, useState } from "react";

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);

  const getData = async () => {
    try {
      const response = await axios.get("/api/treaments/get/web");
      setTreatments(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div
      id="treatments"
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4"
    >
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Our Treatments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {treatments.map((treatment, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">{treatment.NAME}</h2>
            <p className="text-gray-600 mb-3 flex-grow">{treatment.DESCRIPTION}</p>
            <div className="text-sm text-gray-500">
              <p><span className="font-semibold">Duration:</span> {treatment.DURATION} h</p>
              <p><span className="font-semibold">Indication:</span> {treatment.INDICATION}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Treatments;
