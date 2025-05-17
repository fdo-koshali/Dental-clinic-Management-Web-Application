import img5 from "../assets/img5.avif";
import img6 from "../assets/img6.jpg";

const MeetDoctor = () => {

  const doctors = [
    {
      name: "Dr. K H C L S Fernando",
      qualification: "Bachelor of Dental Surgery (BDS)",
      experience: "4.5 years",
      hospital: "Divisional Hospital Thalaimannar",
      unit: "Dental OPD",
      image: img5
    },
    {
      name: "Dr. K H C R K Fernando",
      qualification: "Bachelor of Dental Surgery (BDS)",
      experience: "9 years",
      hospital: "Dental Surgery by Dr K H C R K Fernando",
      unit: "Private Practice",
      image: img6
    }
  ];

  return (
    <div id="meetDoctor" className="min-h-screen bg-gray-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-20">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-12">Meet Our Doctors</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {doctors.map((doctor, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow flex">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{doctor.name}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-blue-600">Qualification:</span>
                    <p className="text-gray-600">{doctor.qualification}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">Experience:</span>
                    <p className="text-gray-600">{doctor.experience}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">Hospital:</span>
                    <p className="text-gray-600">{doctor.hospital}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">Unit:</span>
                    <p className="text-gray-600">{doctor.unit}</p>
                  </div>
                </div>
              </div>
              <div className="w-1/3 ml-4">
                <img src={doctor.image} alt={doctor.name} className="w-[250px] h-[350px] object-cover rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MeetDoctor;
