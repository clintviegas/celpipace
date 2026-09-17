const KEY = 'celpip_mock'

export const MOCK_FLOW = [
  'L1','L2','L3','L4','L5','L6',
  'R1','R2','R3','R4',
  'W1','W2',
  'S1','S2','S3','S4','S5','S6','S7','S8',
]

export const MOCK_SECTION_FOR = {
  L1:'listening', L2:'listening', L3:'listening', L4:'listening', L5:'listening', L6:'listening',
  R1:'reading', R2:'reading', R3:'reading', R4:'reading',
  W1:'writing', W2:'writing',
  S1:'speaking', S2:'speaking', S3:'speaking', S4:'speaking',
  S5:'speaking', S6:'speaking', S7:'speaking', S8:'speaking',
}

export const SECTION_COLOR = {
  listening: '#4A90D9', reading: '#2D8A56', writing: '#C8972A', speaking: '#C8102E',
}

export const PART_LABELS = {
  L1: 'Listening to Problem Solving', L2: 'Daily Life Conversation',
  L3: 'Listening for Information', L4: 'Listening to a News Item',
  L5: 'Listening to a Discussion', L6: 'Listening for Viewpoints',
  R1: 'Reading Correspondence', R2: 'Reading to Apply a Diagram',
  R3: 'Reading for Information', R4: 'Reading for Viewpoints',
  W1: 'Writing an Email', W2: 'Responding to Survey Questions',
  S1: 'Giving Advice', S2: 'Personal Experience',
  S3: 'Describing a Scene', S4: 'Making Predictions',
  S5: 'Comparing and Persuading', S6: 'Dealing with a Difficult Situation',
  S7: 'Expressing Opinions', S8: 'Describing an Unusual Situation',
}

export function getMockState() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) } catch { return null }
}

export function setMockState(state) {
  sessionStorage.setItem(KEY, JSON.stringify(state))
}

export function clearMockState() {
  sessionStorage.removeItem(KEY)
}

export function advanceMockExam(currentPartId, score, navigate) {
  const state = getMockState()
  if (!state) return

  state.scores[currentPartId] = score
  state.flowIdx++

  if (state.flowIdx >= MOCK_FLOW.length) {
    setMockState(state)
    navigate(`/mock-test/${state.examNumber}?results=1`)
    return
  }

  const nextPart = MOCK_FLOW[state.flowIdx]
  const nextSection = MOCK_SECTION_FOR[nextPart]
  setMockState(state)
  navigate(`/${nextSection}/${nextPart}?mock=1`)
}
