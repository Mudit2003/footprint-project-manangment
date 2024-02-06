import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Button,
  VStack,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import authAxios from "../AuthAxios";
import {useParams} from "react-router-dom";

export const ReviewISG = () => {
  const projectData = JSON.parse(decodeURIComponent(useParams().project));

  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [budgetData, setBudgetData] = useState([{ budget: "", cost: "" }]);
  const [formData, setFormData] = useState({
    basicInformation: {
      NAMEOFTHESOCIETY: "",
      dATEOFSUBMISSION: "",
      TITLEOFTHEPROJECT: "",
      address: "",
      provincialSuperior: {
        name: "",
        cellNumber: "",
        email: "",
      },
      projectInCharge: {
        name: "",
        mobile: "",
        email: "",
      },
      overallProjectPeriod: "",
      overallProjectBudget: "",
      numberOfBeneficiaries: "",
      residentialVillages: "",
      selectionCriteriaAndProfile: "",
      descriptionOfBeneficiary: "",
      problemAnalysis: "",
      solutionAnalysis: "",
    },
    logicalFramework: {
      goal: "",
      objectives: [
        {
          objective: "",
          results: [""],
          activities: [],
        },
      ],
    },
    sustainability: "",
    monitoringProcess: "",
    evaluationMethodology: "",
    budgetDetails: [{ budget: "", cost: "" }],
    signatures: {
      projectCoordinatorAgreement: false,
      projectCoordinatorAgreementDate: "",
      projectInChargeAgreement: false,
      projectInChargeAgreementDate: "",
      provincialSuperiorAgreement: false,
      provincialSuperiorAgreementDate: "",
    },

    // Additional Fields
    comment: "",
  });

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formDataCopy = { ...formData }; // Create a copy of formData to avoid direct mutation

  // Map basicInformation fields
  formDataCopy.basicInformation = {
    ...formDataCopy.basicInformation,
    projectInCharge: projectData.applicant,
    NAMEOFTHESOCIETY: projectData.NameOfSociety || "",
    dATEOFSUBMISSION: projectData.DateOfSubmission || "",
    TITLEOFTHEPROJECT: projectData.TitleOfProject || "",
    address: projectData.address || "",
    overallProjectPeriod: projectData.OverallProjectPeriod || "",
    overallProjectBudget: projectData.OverallProjectBudget || "",
    numberOfBeneficiaries: projectData.NumberOfBeneficiaries || "",
    residentialVillages: projectData.ResidentialVillages || "",
    selectionCriteriaAndProfile: projectData.SelectionCriteriaAndProfile || "",
    DescriptionOfBeneficiary: projectData.DescriptionOfBeneficiary || "",
    problemAnalysis: projectData.problemAnalysis || "",
    solutionAnalysis: projectData.solutionAnalysis || "",
  };

  // Map logicalFramework fields
  formDataCopy.logicalFramework.goal = projectData.goal || "";
  formDataCopy.logicalFramework.objectives = projectData.objectives.map(
    (objective) => ({
      objective: objective.objective || "",
      results: objective.results || [""],
      activities: objective.activities.map((activity) => ({
        activity: activity.activity || "",
        timeframe: activity.timeframe || [false],
        verification: activity.verification || "",
      })),
    })
  );

  // Map sustainability, monitoringProcess, evaluationMethodology fields
  formDataCopy.sustainability = projectData.sustainability || "";
  formDataCopy.monitoringProcess = projectData.monitoringProcess || "";
  formDataCopy.evaluationMethodology = projectData.evaluationMethodology || "";

  // Map budgetDetails fields
  setBudgetData(
    projectData.budgetData.map((item) => ({
      budget: item.budget || "",
      cost: item.cost || "",
    }))
  );

  formDataCopy.signatures.projectInChargeAgreement =
    projectData.project_in_charge_agree.agree || false;
  formDataCopy.signatures.projectInChargeAgreementDate =
    projectData.project_in_charge_agree.date || "";
  formDataCopy.signatures.provincialSuperiorAgreement =
    projectData.provincial_superior_agree.agree || false;
  formDataCopy.signatures.provincialSuperiorAgreementDate =
    projectData.provincial_superior_agree.date || "";

  // Additional Fields
  formDataCopy.comment = projectData.comment || "";

  // Update the state with the modified formDataCopy
  setFormData(formDataCopy);

  const handleChange = (e, index, subIndex) => {
    const { name, value } = e.target;
    const updatedData = { ...formData };
    if (name.includes("signatures")) {
      updatedData.signatures[name.split(".")[1]] = value;
    } else if (
      name.includes("provincialSuperior") ||
      name.includes("projectInCharge")
    ) {
      const [field, role] = name.split(".");
      updatedData.basicInformation[role][field] = value;
    } else if (name.includes("budgetDetails")) {
      const [field, dataIndex] = name.split(".");
      updatedData.budgetDetails[dataIndex][field] = value;
    } else if (name.includes("objective")) {
      updatedData.logicalFramework.objectives[index].objective = value;
    } else if (name.includes("result")) {
      updatedData.logicalFramework.objectives[index].results[subIndex] = value;
    } else if (name.includes("activity")) {
      console.log(e.target.name, e.target.value);
      updatedData.logicalFramework.objectives[index].activities[subIndex][
        "activity"
      ] = value;
    } else if (name.includes("verification")) {
      console.log(e.target.name, e.target.value);
      updatedData.logicalFramework.objectives[index].activities[subIndex][
        "verification"
      ] = value;
    } else {
      updatedData.basicInformation[name] = value;
    }

    setFormData(updatedData);
  };

  const handleAddObjective = () => {
    const updatedData = { ...formData };
    updatedData.logicalFramework.objectives.push({
      objective: "",
      results: [""],
      activities: [],
    });
    setFormData(updatedData);
  };

  const handleAddResult = (index) => {
    const updatedData = { ...formData };
    updatedData.logicalFramework.objectives[index].results.push("");
    setFormData(updatedData);
  };

  const handleAddActivity = (index) => {
    const updatedData = { ...formData };
    updatedData.logicalFramework.objectives[index].activities.push({
      activity: "",
      verification: "",
      timeframe: Array.from({ length: 12 }).fill(false),
    });
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your form submission logic here
    try {
      const req = {
        projectID: projectData._id,
        comment_box_provincial_superior: formData.comment,
        provincial_superior_agree: {
          agree: formData.provincialSuperiorAgreement,
        },
      };
      const res = await authAxios.put("/projects/editreviewerISG/", req);
      if (res.data.success) setIsSubmitted(true);
      else {
        showToast({
          title: "Error submitting the reviewed doc",
          status: "error",
          duration: 5000,
        });
        console.log(res.data);
      }
    } catch (e) {
      console.log(e);
      showToast({
        title: "Error submitting the reviewed doc",
        description: e,
        status: "error",
        duration: 5000,
      });
    }
  };
  const BudgetTable = () => {
    // Function to handle changes in budget data
    const handleBudgetChange = (index, field, value) => {
      const newData = [...budgetData];
      newData[index][field] = value;
      setBudgetData(newData);
    };

    // Function to add a new row for budget details
    const handleAddBudgetRow = () => {
      setBudgetData([...budgetData, { budget: "", cost: "" }]);
    };

    // Function to calculate the total amount
    const calculateTotalAmount = () => {
      return budgetData.reduce(
        (total, row) => total + parseFloat(row.cost) || 0,
        0
      );
    };

    return (
      <Box p={4}>
        <Heading as="h1" size="xl" mb={6}>
          Budget Details
        </Heading>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Budget</Th>
              <Th>Cost</Th>
            </Tr>
          </Thead>
          <Tbody>
            {budgetData.map((row, index) => (
              <Tr key={index}>
                <Td>
                  <Input
                    type="text"
                    value={row.budget}
                    onChange={(e) =>
                      handleBudgetChange(index, "budget", e.target.value)
                    }
                    readOnly
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    value={row.cost}
                    onChange={(e) =>
                      handleBudgetChange(index, "cost", e.target.value)
                    }
                    readOnly
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* <Button onClick={handleAddBudgetRow} mt={4}>
          Add Row
        </Button> */}

        <FormControl>
          <FormLabel>Total Amount</FormLabel>
          <Input type="text" value={calculateTotalAmount()} isReadOnly />
        </FormControl>
      </Box>
    );
  };

  return (
    <ChakraProvider>
      <Box p={4}>
        <Heading as="h1" size="xl" mb={6}>
          Institutional Skill Training Application Form
        </Heading>

        {isSubmitted && (
          <Alert status="success" mb={4}>
            <AlertIcon />
            Form submitted successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack align="start" spacing={4} mb={8}>
            {/* Basic Information */}
            {/* NAME OF THE SOCIETY */}
            <FormControl>
              <FormLabel>NAME OF THE SOCIETY</FormLabel>
              <Input
                type="text"
                name="basicInformation.NAMEOFTHESOCIETY"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* DATE OF SUBMISSION */}
            <FormControl>
              <FormLabel>DATE OF SUBMISSION</FormLabel>
              <Input
                type="date"
                name="basicInformation.dATEOFSUBMISSION"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* TITLE OF THE PROJECT */}
            <FormControl>
              <FormLabel>TITLE OF THE PROJECT</FormLabel>
              <Input
                type="text"
                name="basicInformation.TITLEOFTHEPROJECT"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* ADDRESS */}
            <FormControl>
              <FormLabel>ADDRESS</FormLabel>
              <Input
                type="text"
                name="basicInformation.address"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Provincial Superior */}
            <FormControl>
              <FormLabel>Provincial Superior Name</FormLabel>
              <Input
                type="text"
                name="basicInformation.provincialSuperior.name"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Provincial Superior Cell Number</FormLabel>
              <Input
                type="tel"
                name="basicInformation.provincialSuperior.cellNumber"
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Provincial Superior Email</FormLabel>
              <Input
                type="email"
                name="basicInformation.provincialSuperior.email"
                onChange={handleChange}
              />
            </FormControl>
            {/* Project In-Charge */}
            <FormControl>
              <FormLabel>Project In-Charge Name</FormLabel>
              <Input
                type="text"
                name="basicInformation.projectInCharge.name"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Project In-Charge Cell Number</FormLabel>
              <Input
                type="tel"
                name="basicInformation.projectInCharge.cellNumber"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Project In-Charge Email</FormLabel>
              <Input
                type="email"
                name="basicInformation.projectInCharge.email"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Overall Project Period */}
            <FormControl>
              <FormLabel>Overall Project Period (in months)</FormLabel>
              <Input
                type="number"
                name="basicInformation.overallProjectPeriod"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Overall Project Budget */}
            <FormControl>
              <FormLabel>Overall Project Budget</FormLabel>
              <Input
                type="number"
                name="basicInformation.overallProjectBudget"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Target Group */}
            {/* Number of Beneficiaries */}
            <FormControl>
              <FormLabel>Number of Beneficiaries</FormLabel>
              <Input
                type="number"
                name="basicInformation.numberOfBeneficiaries"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Residential Villages of the Beneficiaries */}
            <FormControl>
              <FormLabel>Residential Villages of the Beneficiaries</FormLabel>
              <Textarea
                name="basicInformation.residentialVillages"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Selection Criteria and Profile of the Target Group */}
            <FormControl>
              <FormLabel>
                Selection Criteria and Profile of the Target Group
              </FormLabel>
              <Textarea
                name="basicInformation.selectionCriteriaAndProfile"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Intervention Logic */}
            {/* Brief description of the beneficiaries and the problems they are facing */}
            <FormControl>
              <FormLabel>
                Brief description of the beneficiaries and the problems they are
                facing
              </FormLabel>
              <Textarea
                name="basicInformation.descriptionOfBeneficiary"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Analysis of the Problem to be resolved by the Project */}
            <FormControl>
              <FormLabel>
                Analysis of the Problem to be resolved by the Project
              </FormLabel>
              <Textarea
                name="basicInformation.problemAnalysis"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Solution Analysis */}
            <FormControl>
              <FormLabel>Solution Analysis</FormLabel>
              <Textarea
                name="basicInformation.solutionAnalysis"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Logical Framework */}
            <Heading as="h1" size="xl" mb={6}>
              Logical Framework
            </Heading>
            {/* Goal of the Project */}
            <FormControl>
              <FormLabel>Goal of the Project</FormLabel>
              <Textarea
                name="logicalFramework.goal"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Objectives */}
            <Heading as="h1" size="l" mb={6}>
              Objectives:-
            </Heading>
            {formData.logicalFramework.objectives.map((objective, index) => (
              <Box
                key={index}
                border="1px solid #ccc"
                borderRadius="lg"
                p={4}
                mb={8}
              >
                {/* Objective */}
                <FormControl>
                  <FormLabel>Objective {index + 1}</FormLabel>
                  <Textarea
                    name={`objective.${index}`}
                    value={objective.objective}
                    onChange={(e) => handleChange(e, index)}
                    readOnly
                  />
                </FormControl>
                {/* Results */}
                <FormControl>
                  <FormLabel>Results</FormLabel>
                  {objective.results.map((result, subIndex) => (
                    <Box key={subIndex}>
                      <Textarea
                        name={`result.${index}.${subIndex}`}
                        value={result}
                        onChange={(e) => handleChange(e, index, subIndex)}
                        readOnly
                      />
                      {/* <Button
                        onClick={() => handleAddResult(index)}
                        colorScheme="teal"
                      >
                        Add Result
                      </Button> */}
                    </Box>
                  ))}
                </FormControl>
                {/* Activities and Means of Verification */}
                <FormControl>
                  <FormLabel>Activities and Means of Verification</FormLabel>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Activity</Th>
                        <Th>Means of Verification</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objective.activities.map((activity, subIndex) => (
                        <Tr key={subIndex}>
                          <Td>
                            <Textarea
                              name={`activity.${index}.${subIndex}`}
                              value={activity.activity}
                              onChange={(e) => handleChange(e, index, subIndex)}
                              readOnly
                            />
                          </Td>
                          <Td>
                            <Textarea
                              name={`verification.${index}.${subIndex}`}
                              value={activity.verification}
                              onChange={(e) => handleChange(e, index, subIndex)}
                              readOnly
                            />
                          </Td>
                          <Td>
                            {/* Timeframe */}
                            <FormControl>
                              <FormLabel>Timeframe</FormLabel>
                              {activity.timeframe.map((value, monthIndex) => (
                                <Checkbox
                                  key={monthIndex}
                                  isChecked={value}
                                  onChange={() => {
                                    setSelectedMonths([]);
                                    activity.timeframe[monthIndex] =
                                      !activity.timeframe[monthIndex];
                                    console.log(activity.timeframe);
                                  }}
                                  readOnly
                                >
                                  {new Date(2024, monthIndex).toLocaleString(
                                    "default",
                                    { month: "long" }
                                  )}
                                </Checkbox>
                              ))}
                            </FormControl>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {/* <Button
                    onClick={() => handleAddActivity(index)}
                    colorScheme="teal"
                  >
                    Add Activity
                  </Button> */}
                </FormControl>
                {/* <Button
                    onClick={handleAddObjective}
                    colorScheme="purple"
                    ml="auto"
                    mt={3}
                  >
                    Add Objective
                  </Button> */}
                <hr />
              </Box>
            ))}
            {/* Sustainability of the Project */}
            <FormControl>
              <FormLabel>Sustainability of the Project</FormLabel>
              <Textarea
                name="sustainability"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Explain the Monitoring Process of the Project */}
            <FormControl>
              <FormLabel>
                Explain the Monitoring Process of the Project
              </FormLabel>
              <Textarea
                name="monitoringProcess"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Methodology of Evaluation */}
            <FormControl>
              <FormLabel>Methodology of Evaluation</FormLabel>
              <Textarea
                name="evaluationMethodology"
                onChange={handleChange}
                readOnly
              />
            </FormControl>
            {/* Budget Table */}
            <BudgetTable />
            {/* Signatures */}
            <Heading as="h1" size="xl" mb={6}>
              Signatures
            </Heading>

            {/* Project-In-Charge agreement */}
            <FormControl>
              <Checkbox
                name="signatures.projectInChargeAgreement"
                onChange={handleChange}
                value={formData.signatures.projectInChargeAgreement}
                readOnly
                size="lg"
              >
                The Project-In-Charge agree
              </Checkbox>
              <Input
                type="date"
                value={formData.projectInChargeAgreementDate}
                name="projectInChargeAgreementDate"
                onChange={handleChange}
                readOnly
              />
            </FormControl>

            {/* Provincial Superior agreement */}
            <FormControl isRequired>
              <Checkbox
                name="signatures.provincialSuperiorAgreement"
                onChange={handleChange}
                size="lg"
              >
                The Provincial Superior agree
              </Checkbox>
            </FormControl>
          </VStack>
          <VStack align="start" spacing={4} mb={8}>
            {/* Comment */}
            <FormControl isRequired>
              <FormLabel>Comment(For Reviewer)</FormLabel>
              <Input
                type="text"
                name="comment"
                onChange={handleChange}
                required
              />
            </FormControl>
          </VStack>
          {/* Submit Button */}
          <Button colorScheme="blue" mx={3} type="submit">
            Submit
          </Button>
          {/* decline Button */}
          <Button colorScheme="red" mx={3} type="submit">
            Decline
          </Button>
        </form>
      </Box>
    </ChakraProvider>
  );
};

export default ReviewISG;
