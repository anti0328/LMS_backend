const fetch = require('node-fetch');

const canvasInstance = 'k12.instructure.com';
// const accessToken = '6936~TpgfnRxok6isETnVGDOyqKOmyZAqm0jP2qtO7BakB38czqCoT6AKUuTP0SqNOtQu';
const accessToken = '6936~qSFOAGSTIS65FuZtfw5q9OT88CIcauImi1NMifOjtJagUklzXhBBcQjLA7fXRSN5';
const apiUrl = `https://${canvasInstance}/api/v1/courses?per_page=12`;

const getCourses = async (req, res) => {
    // let tmp = []
    await getAllCourses(apiUrl).then(async courses => {
        if (courses) {

            for (var i = 0; i < courses.length; i++) {
                courses[i].progress = await getProgressById(courses[i].id)
            }

        }
        res.send(courses)
    });

};

const getProgressById = async (courseId) => {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/assignments`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json'
        },
    };

    try {
        const response = await fetch(url, options);
        const assignments = await response.json();
        const totalAssignments = assignments.length;
        const publishedAssignments = await assignments.filter(assignment => assignment.published).length;
        let rlt = publishedAssignments / totalAssignments * 100;
        return rlt;
    } catch (error) {
        console.error('Failed to retrieve assignments:', error);
    }
}

const getContentById = async (req, res) => {
    // console.log(req.query.course_id);
    try {
        const response = await fetch(`https://${canvasInstance}/api/v1/courses/${req.query.course_id}/modules?per_page=200`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const contents = await response.json();
        return res.send(contents);
        // console.log(contents)

    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
};

async function getAllCourses(url, allCourses = []) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const courses = await response.json();
        // allCourses.push(...courses);

        // const linkHeader = response.headers.get('link');
        // const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));

        // if (nextLink) {
        //     const nextUrl = nextLink.split(';')[0].slice(1, -1);
        //     return getAllCourses(nextUrl, allCourses);
        // }

        return courses;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
}

module.exports = {
    getCourses,
    getContentById,
    // getMyCourses
}
