
const domain = "https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql";

export async function fetchData(jwt, query) {
    try {
        const response = await makeRequest(`${domain}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ query }),
        });
        return response;
    } catch (error) {
        console.error("GraphQL request failed:", error.message);
        throw error;
    }
}
export async function makeRequest(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed with status " + response.status);
    }
    return response.json();
}
export async function fetchBasicUserData(jwt) {
    const query = `
    {
      user {
        id
        email
        githubLogin: login
        firstName
        lastName
        createdAt
        attrs
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        return responseData.data.user;
    } catch (error) {
        console.error("Error fetching basic user data:", error.message);
        throw error;
    }
}
export async function fetchXpData(jwt) {
    const userId = (await fetchBasicUserData(jwt))[0].id;
    const query = `
    {
      event_user(where: {userId: {_eq: ${userId}}} limit: 1) {
        user {
          transactions_aggregate(
            where: {type: {_eq: "xp"}, _and: {event: {object: {id: {_eq: 100256}}}}}
          ) {
            aggregate {
              sum {
                amount
              }
            }
          }
        }
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        const xpAmount = Math.round(responseData.data.event_user[0].user.transactions_aggregate.aggregate.sum.amount / 1000);
        return xpAmount;
    } catch (error) {
        console.error("Error fetching XP data:", error.message);
        throw error;
    }
}
export async function fetchGradeData(jwt) {
    const query = `
    {
      event_user(where: { event: { path: { _ilike: "/dakar/div-01"}}}, order_by: { user: { login: asc}}, limit: 1) {
        level
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        return responseData.data.event_user[0].level;
    } catch (error) {
        console.error("Error fetching grade data:", error.message);
        throw error;
    }
}
export async function fetchRatioData(jwt) {
    const query = `
    {
      user {
        auditRatio
        totalUp
        totalDown
        fail : audits (where:{grade:{_lt : 1}},order_by:{createdAt:asc}){
            grade
        }
        pass : audits (where:{grade:{_gte : 1}},order_by:{createdAt:asc}){
            grade
        }
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        const auditRatio = responseData.data.user[0].auditRatio.toFixed(2);
        const auditDone = Math.round(responseData.data.user[0].totalUp / 1000);
        const auditReceived = Math.round(responseData.data.user[0].totalDown / 1000);
        const auditFails = responseData.data.user[0].fail.length;
        const auditPasses = responseData.data.user[0].pass.length;

        console.log("Audit Fails:", auditFails);
        console.log("Audit Passes:", auditPasses);
        return { auditRatio, auditDone, auditReceived, auditFails, auditPasses };
    } catch (error) {
        console.error("Error fetching ratio data:", error.message);
        throw error;
    }
}
export async function fetchSkillsData(jwt) {
    const query = `
    {
      user {
        transactions (
          order_by: [{ type: desc }, { amount: desc }]
          distinct_on: [type]
          where: {
            type: { _like: "skill_%" }
          }
        )
        {
          type
          amount
        }
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        const sortedSkills = responseData.data.user[0].transactions;
        const skillLabels = sortedSkills.map(skill => skill.type.replace("skill_", ""));
        const skillData = sortedSkills.map(skill => skill.amount);
        return { skillLabels, skillData };
    } catch (error) {
        console.error("Error fetching skills data:", error.message);
        throw error;
    }
}
export async function fetchProject(jwt) {
    const query = `
    {
      transaction(
        where: { type: {_eq: "xp"}, event: {path: {_eq: "/dakar/div-01"}}, path: {_nlike: "%checkpoint%", _nilike: "%piscine-js%"}}
      ) {
        amount
        path
      }
    }
  `;

    try {
        const responseData = await fetchData(jwt, query);
        const projects = responseData.data.transaction;
        // console.log("number-projects:", projects.length);
        return projects;
    } catch (error) {
        console.error("Error fetching project data:", error.message);
        throw error;
    }
}