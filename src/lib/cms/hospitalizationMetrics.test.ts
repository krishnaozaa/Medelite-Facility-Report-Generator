import { describe, expect, it } from "vitest";

import { emptyHospitalizationMetrics, mapCmsHospitalizationMetrics } from "./hospitalizationMetrics";

const stateAveragesRow = {
  state_or_nation: "FL",
  percentage_of_short_stay_residents_who_were_rehospitalized__1d02: "23.8",
  percentage_of_short_stay_residents_who_had_an_outpatient_em_d911: "9.3",
  number_of_hospitalizations_per_1000_longstay_resident_days: "1.95",
  number_of_outpatient_emergency_department_visits_per_1000_l_de9d: "1.21",
};

const nationalAveragesRow = {
  state_or_nation: "NATION",
  percentage_of_short_stay_residents_who_were_rehospitalized__1d02: "21.5",
  percentage_of_short_stay_residents_who_had_an_outpatient_em_d911: "11.6",
  number_of_hospitalizations_per_1000_longstay_resident_days: "1.65",
  number_of_outpatient_emergency_department_visits_per_1000_l_de9d: "1.65",
};

describe("mapCmsHospitalizationMetrics", () => {
  it("maps the golden claims and state/national average values", () => {
    expect(
      mapCmsHospitalizationMetrics(
        [
          {
            measure_code: "521",
            measure_description:
              "Percentage of short-stay residents who were rehospitalized after a nursing home admission",
            resident_type: "Short-Stay",
            adjusted_score: "18.7",
          },
          {
            measure_code: "522",
            measure_description:
              "Percentage of short-stay residents who had an outpatient emergency department visit",
            resident_type: "Short-Stay",
            adjusted_score: "13.9",
          },
          {
            measure_code: "551",
            measure_description: "Number of hospitalizations per 1000 long-stay resident days",
            resident_type: "Long-Stay",
            adjusted_score: "1.86",
          },
          {
            measure_code: "552",
            measure_description:
              "Number of outpatient emergency department visits per 1000 long-stay resident days",
            resident_type: "Long-Stay",
            adjusted_score: "6.94",
          },
        ],
        stateAveragesRow,
        nationalAveragesRow,
      ),
    ).toEqual({
      strHospitalization: 18.7,
      strHospitalizationNationalAvg: 21.5,
      strHospitalizationStateAvg: 23.8,
      strEdVisit: 13.9,
      strEdVisitNationalAvg: 11.6,
      strEdVisitStateAvg: 9.3,
      ltHospitalization: 1.86,
      ltHospitalizationNationalAvg: 1.65,
      ltHospitalizationStateAvg: 1.95,
      ltEdVisit: 6.94,
      ltEdVisitNationalAvg: 1.65,
      ltEdVisitStateAvg: 1.21,
    });
  });

  it("matches claims by description aliases when measure codes vary", () => {
    const metrics = mapCmsHospitalizationMetrics(
      [
        {
          measure_code: "999",
          measure_description:
            "Percentage of short stay residents who were rehospitalized after a nursing home admission",
          resident_type: "Short Stay",
          adjusted_score: "18.7",
        },
        {
          measure_description:
            "Percentage of short stay residents who had an outpatient emergency department visit",
          resident_type: "Short Stay",
          adjusted_score: "13.9",
        },
        {
          measure_description: "Number of hospitalizations per 1000 long stay resident days",
          adjusted_score: "1.86",
        },
        {
          measure_description:
            "Number of outpatient emergency department visits per 1000 long stay resident days",
          adjusted_score: "6.94",
        },
      ],
      null,
      null,
    );

    expect(metrics.strHospitalization).toBe(18.7);
    expect(metrics.strEdVisit).toBe(13.9);
    expect(metrics.ltHospitalization).toBe(1.86);
    expect(metrics.ltEdVisit).toBe(6.94);
  });

  it("falls back to observed score and treats footnoted claims as missing", () => {
    const metrics = mapCmsHospitalizationMetrics(
      [
        {
          measure_code: "521",
          adjusted_score: "",
          observed_score: "17.2",
        },
        {
          measure_code: "522",
          adjusted_score: "13.9",
          footnote_for_the_measure_score: "9",
        },
      ],
      null,
      null,
    );

    expect(metrics.strHospitalization).toBe(17.2);
    expect(metrics.strEdVisit).toBeNull();
  });

  it("returns N/A-ready nulls when claims, state, or national rows are unavailable", () => {
    expect(mapCmsHospitalizationMetrics([], null, null)).toEqual(emptyHospitalizationMetrics);
  });
});
