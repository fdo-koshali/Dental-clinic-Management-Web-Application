import {
  generateIdService,
  findTimeSlotService,
  createAppointmentService,
  getUpcommingDataService,
  changeAppoinmnetStatusService,
  getTodayDataService,
  updateChargesService,
  changePaymnetStatusService,
  addItemsToPatientService,
  getAppoinmnetItemDataService,
  deleteAppoinmnetItemDataService,
  getPastDataService,
} from "../services/appointment-service.js";

// generate ID
export const generateIdController = async (req, res) => {
  try {
    const userId = await generateIdService();
    res.status(200).json(userId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// find time slot
export const findTimeSlotController = async (req, res) => {
  try {
    const { duration, date, timePreference } = req.body;
    const timeSlot = await findTimeSlotService(duration, date, timePreference);
    res.status(200).json(timeSlot);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// create appointment
export const createAppointmentController = async (req, res) => {
  try {
    const { appointmentId, charges, date, doctorId, endTime,patientId,startTime,treatmentId } = req.body;

    const appointment = await createAppointmentService(appointmentId, charges, date, doctorId, endTime,patientId,startTime,treatmentId);
    res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get upcoming appointments data
export const getUpcommingDataController = async (req, res) => {
  const { userId, relatedIds } = req.body;
  try {
    const upcomingData = await getUpcommingDataService(userId, relatedIds);
    res.status(200).json(upcomingData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// change appointment status
export const changeAppoinmnetStatusController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const updatedAppointment = await changeAppoinmnetStatusService(appointmentId, status);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get today appointment data
export const getTodayDataController = async (req, res) => {
  try {
    const todayData = await getTodayDataService();
    res.status(200).json(todayData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// update charges and notes
export const updateChargesController = async (req, res) => {
  try {
    const { additionalCharges, appointmentId, doctorNote } = req.body;
    const updatedAppointment = await updateChargesService( additionalCharges, appointmentId, doctorNote);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// change payment status
export const changePaymnetStatusController = async (req, res) => {
  try {
    const { appointmentId, paymentStatus } = req.body;
    const updatedAppointment = await changePaymnetStatusService(appointmentId, paymentStatus);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// add items to patient
export const addItemsToPatientController = async (req, res) => {
  try {
    const { appointmentId, itemId,quantity } = req.body;
    const result = await addItemsToPatientService( appointmentId, itemId,quantity);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get appointment item data
export const getAppoinmnetItemDataController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentItemData = await getAppoinmnetItemDataService(id);
    res.status(200).json(appointmentItemData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// delete appointment item data
export const deleteAppoinmnetItemDataController = async (req, res) => {
  try {
    const { appointmentId, itemId, quantity } = req.body;
    const result = await deleteAppoinmnetItemDataService(appointmentId, itemId, quantity);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get past appointment data
export const getPastDataController = async (req, res) => {
  const { id } = req.params;
  try {
    const pastData = await getPastDataService(id);
    res.status(200).json(pastData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}