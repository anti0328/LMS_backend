const fetch = require('node-fetch');

const canvasInstance = 'k12.instructure.com';
// const accessToken = '6936~5ImUFdFYh3oKhC0QYY60w8t8xnO8JQUh5aXg6jmaVBFWKLMBEeu7moq9h1LSxl5H';
const accessToken = '6936~qSFOAGSTIS65FuZtfw5q9OT88CIcauImi1NMifOjtJagUklzXhBBcQjLA7fXRSN5';
const apiUrl = `https://${canvasInstance}/api/v1/courses?per_page=9`;

const getCourses = async (req, res) => {
    await getAllCourses(apiUrl + `&page=${req.query.pageNum}`, req.query.token).then(async courses => {
        if (courses) {
            for (var i = 0; i < courses.length; i++) {
                courses[i].progress = await getProgressById(courses[i].id);
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

const getLecture = async (req, res) => {
    console.log(req.query)
    const url = `https://k12.instructure.com/api/v1/courses/${req.query.info.course_id}/pages/${req.query.info.page_url}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json'
        },
    };

    try {
        const response = await fetch(url, options);
        const rlt = await response.json();
        res.send(rlt);
    } catch (error) {
        console.error('Failed to retrieve assignments:', error);
    }
}

// const getCourseEnrollments = async (courseId) => {
//     const url = `https://${canvasInstance}/api/v1/courses/${courseId}/enrollments`;
//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'content-type': 'application/json'
//         },
//     };

//     try {
//         const response = await fetch(url, options);
//         const enrollments = await response.json();
//         return enrollments;
//     } catch (error) {
//         console.error('Failed to retrieve assignments:', error);
//     }
// }

async function fetchModules(courseId) {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/modules`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error('Failed to fetch modules');
    }
    return response.json();
}

const fetchModuleItems = async (courseId, moduleId) => {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/modules/${moduleId}/items`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch module items for module ${moduleId}`);
    }
    return response.json();
}


const getContentById = async (req, res) => {
    try {
        const modules = await fetchModules(req.query.course_id);
        for (var i = 0; i < modules.length; i++) {
            const items = await fetchModuleItems(req.query.course_id, modules[i].id);
            modules[i].lessons = await items;
        }

        res.send(modules)
    } catch (error) {
        console.error(error);
    }
};


async function getAllCourses(url, token) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const courses = await response.json();
        return courses;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
}

const getTotal = async (req, res) => {
    const count = await getTotalCount(`https://${canvasInstance}/api/v1/courses?per_page=100`, req.query.token);
    res.send({ count })
}

async function getTotalCount(url, token, allCourses = []) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const courses = await response.json();
        allCourses.push(...courses);

        const linkHeader = response.headers.get('link');
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));

        if (nextLink) {
            const nextUrl = nextLink.split(';')[0].slice(1, -1);
            return getTotalCount(nextUrl, token, allCourses);
        }
        return allCourses.length;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
}



module.exports = {
    getCourses,
    getContentById,
    getTotal,
    getLecture
    // getMyCourses
}
