# Project Description

This project is running using 2 main components, the first component Wemos D1 Mini as processor and Wifi The second part of the Max30100 pulse oximeter module, which we will discuss in the following way:

The function of the sensor is that first two light wavelengths of two red-LEDs and infrared are emitted; This light passes through the tissues and is received by an optical receiver. Red light by hemoglobin and infrared light Red is absorbed by oxyhemoglobin and absorption is measured by an optical detector. It actually measures the amount of oxygen as a percentage of the hemoglobin molecules that are mixed with oxygen relative to the total amount of hemoglobin molecules.

Heart rate is detected by changing the volume of blood around the finger, that is, by the amount of light that passes through the finger. (Taken from the module datasheet)

![image](https://user-images.githubusercontent.com/98252080/160624639-627fe14f-5e19-4d22-a679-cf80783f7041.png)

For ease of work and having a road map, we have divided this project into several phases to prioritize these phases and Due to time and cost constraints, we should travel the route as much as possible, and if the process of each phase is prolonged, the next phase will start in parallel to achieve the best result by managing time.

# First_phase
Objective: 
Test the purchased parts and initial start-up of the project

Challenges and solutions:

Challenge: Install the components on the board.

Solution: 
Due to the small size of the module and the sensitivity of its medical sensor, to solder the header pin to the module, a low wattage and a thin tip were needed, which we solved with the help of an out-of-university electronics specialist.

Challenge: Component health testing

Solution: To test the pulse oximeter module, there was conflicting information on the Internet. Imported in Iran has a problem and it is necessary to separate the three 4.7 kV resistors on the board with a heater and replace it with a 1 kOhm resistor by installing it on the board. This problem was solved without removing the resistors by several trials and errors.

First phase output:
![image](https://user-images.githubusercontent.com/98252080/160626429-4c2f7aa0-789f-4945-a16a-e286aff19fb8.png)
