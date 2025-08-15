import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be at least 1"]
  },
  course: {
    type: String,
    required: [true, "Course is required"],
    trim: true
  }
}, {
  timestamps: true 
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
