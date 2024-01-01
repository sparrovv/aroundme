import { DistanceFromLocation, PointOfInterest, ScoreConfig } from "./types"

import { GroupedPOIs } from "."


export const defaultConfig: ScoreConfig[] = [
    {placeType: 'restaurant', weight: 2, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'school', weight: 2, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'primary school', weight: 3, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'przedszkole', weight: 3, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'ośrodek zdrowia', weight: 4, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'szkoła podstawowa', weight: 4, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'bus stop', weight: 3, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'tram stop', weight: 5, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'discount', weight: 4, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'gym', weight: 4, distanceType: 'walking', thresholdInMinutes: 15},
    {placeType: 'cinema', weight: 4, distanceType: 'public', thresholdInMinutes: 25},
    {placeType: 'theatre', weight: 4, distanceType: 'public', thresholdInMinutes: 25},
]

export interface ScoredPlace {
    placeType: PointOfInterest
    score: number
    count: number
}

export interface Score {
    score: number
    scoredPlaces: ScoredPlace[]
}

export const calculateScore = (groupedLocations: GroupedPOIs, config: ScoreConfig[] = defaultConfig) => {
    const scoresPerPlace = Object.keys(groupedLocations).map((key) => {
        const places = groupedLocations[key as PointOfInterest]
        const placeConfig = config.find((c) => c.placeType === key)
        if (!placeConfig) {
            return {placeType: key, score: 0, count: places.length}
        }

        const calculateScoreForPlace = (places: DistanceFromLocation[], config: ScoreConfig) => {
            const numberOfPlacesWithinThreshold = places.filter((p) => {
                if (config.distanceType === 'walking') {
                    return p.walkingDurationInMinutes && p.walkingDurationInMinutes < config.thresholdInMinutes
                }

                return false
            }).length

            if (numberOfPlacesWithinThreshold === 0) {
                return {score:0, count:0}
            }
            if (numberOfPlacesWithinThreshold === 1) {
                return {score: config.weight, count: 1}
            }else{
                return {score: config.weight + (config.weight / 2), count: numberOfPlacesWithinThreshold}
            }
        }

        const {score, count} = calculateScoreForPlace(places, placeConfig)

        return {placeType: key, score, count}
    })

    const totalScore = scoresPerPlace.reduce((acc, curr) => acc + curr.score, 0)
    return {score: totalScore, scoredPlaces: scoresPerPlace}
}
