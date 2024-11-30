import { useMemo } from 'react'
import { Survey, SurveyQuestion, SurveyResponse } from '../types/survey'

interface SurveyStatsProps {
  survey: Survey & { responses: SurveyResponse[] }
}

export function SurveyStats({ survey }: SurveyStatsProps) {
  const stats = useMemo(() => {
    const totalResponses = survey.responses.length
    const completionRate = totalResponses > 0 ? 
      survey.responses.filter((r: SurveyResponse) => 
        survey.questions.every((q) => r.answers[q.id])
      ).length / totalResponses * 100 : 0

    const averageTimeToComplete = totalResponses > 0 ?
      survey.responses.reduce((acc: number, r: SurveyResponse) => {
        const startTime = new Date(r.created_at).getTime()
        const endTime = new Date(r.updated_at).getTime()
        return acc + (endTime - startTime)
      }, 0) / totalResponses / 1000 : 0

    const questionStats = survey.questions.map((q: SurveyQuestion) => {
      const answers = survey.responses.map((r) => r.answers[q.id]).filter(Boolean)
      const answerCount = answers.length

      if (q.type === 'radio' || q.type === 'checkbox') {
        const optionCounts = (q.options || []).reduce((acc: Record<string, number>, opt) => {
          acc[opt] = answers.filter((a) => 
            Array.isArray(a) ? a.includes(opt) : a === opt
          ).length
          return acc
        }, {})

        return {
          questionId: q.id,
          text: q.text,
          type: q.type,
          answerCount,
          optionCounts,
        }
      }

      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        answerCount,
      }
    })

    return {
      totalResponses,
      completionRate,
      averageTimeToComplete,
      questionStats,
    }
  }, [survey])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.totalResponses}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.completionRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg. Time to Complete</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.averageTimeToComplete.toFixed(1)}s</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Question Statistics</h2>
        {stats.questionStats.map((stat) => (
          <div key={stat.questionId} className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium">{stat.text}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {stat.answerCount} responses ({((stat.answerCount / stats.totalResponses) * 100).toFixed(1)}% response rate)
            </p>
            {'optionCounts' in stat && (
              <div className="mt-4 space-y-2">
                {Object.entries(stat.optionCounts).map(([option, count]) => (
                  <div key={option} className="flex items-center">
                    <span className="flex-1">{option}</span>
                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(count / stats.totalResponses) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {count} ({((count / stats.totalResponses) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
