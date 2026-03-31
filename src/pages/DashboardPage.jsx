import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    clb: 8,
    targetClb: 10,
    joinDate: 'Jan 15, 2024',
    totalTests: 12,
    totalQuestions: 287,
  })

  const [skillScores, setSkillScores] = useState({
    listening: { current: 8, target: 10, attempts: 12, best: 9 },
    reading: { current: 7, target: 10, attempts: 11, best: 8 },
    writing: { current: 8, target: 10, attempts: 10, best: 9 },
    speaking: { current: 9, target: 10, attempts: 13, best: 9 },
  })

  const [recentTests, setRecentTests] = useState([
    {
      id: 1,
      name: 'Full Mock Test #12',
      date: 'Today',
      listening: 8,
      reading: 7,
      writing: 8,
      speaking: 9,
      overall: 8,
      status: 'completed',
    },
    {
      id: 2,
      name: 'Full Mock Test #11',
      date: '2 days ago',
      listening: 7,
      reading: 7,
      writing: 7,
      speaking: 8,
      overall: 7.25,
      status: 'completed',
    },
    {
      id: 3,
      name: 'Reading Section Practice',
      date: '5 days ago',
      reading: 8,
      status: 'completed',
    },
    {
      id: 4,
      name: 'Full Mock Test #10',
      date: '1 week ago',
      listening: 7,
      reading: 6,
      writing: 7,
      speaking: 8,
      overall: 7,
      status: 'completed',
    },
  ])

  const [stats, setStats] = useState([
    { icon: '📊', label: 'Average Score', value: '7.8', trend: '+0.3' },
    { icon: '🎯', label: 'Tests Completed', value: '12', trend: '+2' },
    { icon: '✓', label: 'Questions Done', value: '287', trend: '+45' },
    { icon: '⏱️', label: 'Hours Studied', value: '34', trend: '+5' },
  ])

  const [progressData, setProgressData] = useState([
    { week: 'Week 1', score: 6.5 },
    { week: 'Week 2', score: 6.8 },
    { week: 'Week 3', score: 7.2 },
    { week: 'Week 4', score: 7.5 },
    { week: 'Week 5', score: 7.8 },
    { week: 'Week 6', score: 8.0 },
  ])

  const skillsArray = [
    { name: 'Listening', key: 'listening', icon: '🎧', color: '#4A90D9' },
    { name: 'Reading', key: 'reading', icon: '📖', color: '#50C878' },
    { name: 'Writing', key: 'writing', icon: '✍️', color: '#FFB84D' },
    { name: 'Speaking', key: 'speaking', icon: '🎙️', color: '#FF6B6B' },
  ]

  const getScoreColor = (score, target = 10) => {
    const percentage = (score / target) * 100
    if (percentage >= 90) return '#16A34A'
    if (percentage >= 75) return '#FBBF24'
    if (percentage >= 60) return '#F97316'
    return '#EF4444'
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <motion.div
          className="dashboard-welcome"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome back, {userData.name}! 👋</h1>
          <p>You're on track to reach CLB {userData.targetClb}. Keep practicing!</p>
        </motion.div>
      </div>

      <div className="dashboard-container">
        {/* Quick Stats */}
        <section className="dashboard-section">
          <h2>Your Progress at a Glance</h2>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.label}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-trend">↑ {stat.trend} this month</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main CLB Progress */}
        <section className="dashboard-section dashboard-grid-2">
          {/* Current Level */}
          <motion.div
            className="clb-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="clb-header">
              <h2>Current CLB Level</h2>
            </div>
            <div className="clb-display">
              <div className="clb-circle">
                <span className="clb-number">{userData.clb}</span>
              </div>
              <div className="clb-info">
                <p className="clb-target">Target: CLB {userData.targetClb}</p>
                <div className="clb-progress-bar">
                  <div
                    className="clb-progress-fill"
                    style={{ width: `${(userData.clb / userData.targetClb) * 100}%` }}
                  />
                </div>
                <p className="clb-remaining">
                  {userData.targetClb - userData.clb} points to goal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress Chart */}
          <motion.div
            className="progress-chart-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Progress Over Time</h2>
            <div className="chart-container">
              <div className="mini-chart">
                {progressData.map((item, i) => (
                  <motion.div
                    key={item.week}
                    className="chart-bar-wrapper"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  >
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(item.score / 10) * 100}%`,
                        backgroundColor: getScoreColor(item.score),
                      }}
                    />
                    <span className="chart-label">{item.week}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Skill Breakdown */}
        <section className="dashboard-section">
          <h2>Score by Skill</h2>
          <div className="skills-grid">
            {skillsArray.map((skill, i) => {
              const skillData = skillScores[skill.key]
              const percentage = (skillData.current / skillData.target) * 100
              return (
                <motion.div
                  key={skill.key}
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="skill-header">
                    <span className="skill-icon">{skill.icon}</span>
                    <h3>{skill.name}</h3>
                  </div>

                  <div className="skill-scores">
                    <div className="score-display">
                      <div className="current-score">
                        <span className="label">Current</span>
                        <span className="number" style={{ color: getScoreColor(skillData.current) }}>
                          {skillData.current}
                        </span>
                      </div>
                      <div className="target-score">
                        <span className="label">Target</span>
                        <span className="number">{skillData.target}</span>
                      </div>
                    </div>

                    <div className="skill-progress">
                      <div className="progress-background">
                        <motion.div
                          className="progress-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                          style={{ backgroundColor: skill.color }}
                        />
                      </div>
                      <span className="percentage">{Math.round(percentage)}%</span>
                    </div>
                  </div>

                  <div className="skill-stats">
                    <div className="stat-row">
                      <span>Attempts: {skillData.attempts}</span>
                      <span className="best-score">Best: {skillData.best}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn" onClick={() => navigate('/exam')}>
              View All Tests →
            </button>
          </div>

          <div className="activity-list">
            {recentTests.map((test, i) => (
              <motion.div
                key={test.id}
                className="activity-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="activity-left">
                  <div className="activity-icon">
                    {test.overall ? '📋' : '📖'}
                  </div>
                  <div className="activity-info">
                    <h4>{test.name}</h4>
                    <p className="activity-date">{test.date}</p>
                  </div>
                </div>

                <div className="activity-right">
                  {test.overall ? (
                    <div className="activity-scores">
                      <span
                        className="overall-score"
                        style={{ color: getScoreColor(test.overall) }}
                      >
                        {test.overall.toFixed(2)}
                      </span>
                      <div className="mini-scores">
                        <span title="Listening">🎧 {test.listening}</span>
                        <span title="Reading">📖 {test.reading}</span>
                        <span title="Writing">✍️ {test.writing}</span>
                        <span title="Speaking">🎙️ {test.speaking}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="activity-scores">
                      <span style={{ color: getScoreColor(test.reading) }}>
                        {test.reading}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="dashboard-section">
          <h2>Personalized Recommendations</h2>
          <div className="recommendations-grid">
            <motion.div
              className="recommendation-card focus-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="rec-icon">📍</div>
              <h3>Focus Area</h3>
              <p>Your Reading score needs the most improvement. Try 10 more Reading section tests this week.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/reading')}>
                Start Reading Practice →
              </button>
            </motion.div>

            <motion.div
              className="recommendation-card strength"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <div className="rec-icon">⭐</div>
              <h3>Your Strength</h3>
              <p>Speaking is your strongest skill at CLB 9. Keep practicing to reach your CLB 10 goal!</p>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/speaking')}>
                Continue Speaking →
              </button>
            </motion.div>

            <motion.div
              className="recommendation-card milestone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="rec-icon">🎯</div>
              <h3>Next Milestone</h3>
              <p>You're 2 points away from CLB 10! Complete 3 more full mock tests to lock in your score.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/exam')}>
                Take a Mock Test →
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
